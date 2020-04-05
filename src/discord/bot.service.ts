import { Client, Collection, Message, TextChannel } from "discord.js";
import { inject } from "inversify";
import { fluentProvide } from "inversify-binding-decorators";
import { SERVICE } from "../constants/services";
import { LuisService } from "../luis/luis.provider";
import { guard } from "./guard.decorator";
import { notMe } from "./guards/author-not-me";
import { contentNotEmpty } from "./guards/content-not-empty";
import { INTENT_HANDLER } from "./intent.handler";
import { buildDebugMessage } from "./message.handler";

/**
 * Represents a Discord onMessage handler
 */
export type DiscordMessageHandler = (msg: Message, client: Client) => void;

/**
 * Represents a bot provider class that can provide
 * a discord Bot instance
 */
export interface BotProvidable {
    /**
     * Gets the discord bot instance
     */
    getBot(): Client;
}

/**
 * Represents the Neruko bot instance
 */
@fluentProvide(SERVICE.Bot)
    .inSingletonScope()
    .done()
export class Neruko implements BotProvidable {

    private bot: Client;

    constructor(
        @inject(SERVICE.Luis) private luis: LuisService
    ) {
        const bot = this.bot = new Client();
        bot.on("ready", () => {
            console.log(`Logged in as ${bot.user.tag}!`);
            console.log(`Output to: ${process.env.CHANNEL_ID}`);
        });
        bot.on("message", (msg) => this.onMessage(msg, bot));
        // Make sure Discord bot is logged in before anything.
        bot.login(process.env.DISCORD_TOKEN);
    }

    /**
     * @inheritdoc
     */
    getBot(): Client {
        return this.bot;
    }

    @guard(
        notMe,
        contentNotEmpty
    )
    private async onMessage(msg: Message, client: Client): Promise<void> {
        const result = await this.luis.predictDiscordAsync(msg);

        // Handle the intent
        await INTENT_HANDLER[result.prediction.topIntent](msg);

        // Output debug message
        const reply = buildDebugMessage(result, msg);
        if (reply === null) { return; } // Do not register None intents
        const channels = client.channels as Collection<string, TextChannel>;
        const talkChannels =  channels.filter((c) => c.id === process.env.HOME_CHANNEL_ID);
        talkChannels.forEach((c) => {
                c.send(reply);
            });
    }
}
