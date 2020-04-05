import { Client, Collection, Message, TextChannel } from "discord.js";
import { inject } from "inversify";
import { fluentProvide } from "inversify-binding-decorators";
import { PROVIDER } from "../constants/providers";
import { SERVICE } from "../constants/services";
import { LuisRecognizerProvider } from "../luis/luis.provider";
import { guard } from "./guard.decorator";
import { notMe } from "./guards/not-me";
import { contentNotEmpty } from "./guards/content-not-empty";

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
        @inject(PROVIDER.LuisRecognizer) private luisProvider: LuisRecognizerProvider
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
    private onMessage(msg: Message, client: Client): void {
        const channels = this.bot.channels as Collection<string, TextChannel>;
        const talkChannels =  channels.filter((c) => c.id === process.env.HOME_CHANNEL_ID);
        talkChannels.forEach((c) => {
                c.send(this.bot.user.id);
            });
    }
}
