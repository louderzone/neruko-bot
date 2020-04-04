import { Client, Collection, Message, TextChannel } from "discord.js";
import { inject } from "inversify";
import { fluentProvide } from "inversify-binding-decorators";
import { SERVICE } from "../constants/services";
import { LuisService } from "../luis/luis.service";
import { command } from "./command.decorator";
import { nrkReply, REPLY_COMMAND } from "./commands/nrk-reply";
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
    @command({ prefix: REPLY_COMMAND }, nrkReply)
    private async onMessage(msg: Message, client: Client): Promise<void> {
        const { author, content } = msg;
        if (author.id === "") {
            let replyText = content;
            const searchForEmojis = /:([A-z0-9-_]+):/g;
            const emojisFound = content.match(searchForEmojis);
            if (emojisFound.length === 0) { return; } // No emoji is found in this text
            emojisFound.forEach((emoteString) => {
                const name = emoteString.replace(/:/g, "");
                const emoji = msg.guild.emojis.find((e) => e.name === name);
                replyText = replyText.replace(emoteString, emoji.toString());
            });
            msg.delete();
            msg.channel.send(`${replyText} - By <@${author.id}>`);
            return;
        }

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
