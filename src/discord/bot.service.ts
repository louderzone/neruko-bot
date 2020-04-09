import { Client, Message, MessageReaction, TextChannel, User, } from "discord.js";
import { inject } from "inversify";
import { fluentProvide } from "inversify-binding-decorators";
import { SERVICE } from "../constants/services";
import { MongoDb } from "../database/mongodb.service";
import { ANNOUNCE_PURPOSE_TW_ONBOARD } from "../express/announce.controller";
import { LuisService } from "../luis/luis.service";
import { command, fixedCommand } from "./command.decorator";
import {
    BOOST_REGISTER_COMMAND,
    BOOST_UNREGISTER_COMMAND,
    boostRegister,
    boostUnregister
} from "./commands/boost-register";
import { NICKNAME_RESET_COMMAND, nrkNickReset } from "./commands/nrk-nick-reset";
import { NERUKO_REGISTER_COMMAND, nrkRegister } from "./commands/nrk-register";
import { nrkReply, REPLY_COMMAND } from "./commands/nrk-reply";
import { guard } from "./guard.decorator";
import { notMe } from "./guards/author-not-me";
import { contentNotEmpty } from "./guards/content-not-empty";
import { INTENT_HANDLER } from "./intent.handler";
import { buildDebugMessage } from "./message.handler";
import { nitro } from "./nitro.decorator";
import { DECLINE_REACTION, OK_REACTION } from "./reactions";

export const NERUKO_NAME = "neruko";
export const NERUKO_DISPLAY_NAME = "ねるこ";

const ANALYZE_LIST = [
    "打",
    "衝",
    "跑",
    "沖",
    "婆",
    "香",
    "T1",
    "DD",
    "推"
];

/**
 * Represents a Discord onMessage handler
 */
export type DiscordMessageHandler = (args: MessageHandlerArguments) => Promise<void>;

/**
 * Represents the arguments supplied to a Discord OnMessage handler
 */
export interface MessageHandlerArguments {
    /**
     * Gets the discord message
     */
    readonly msg: Message;

    /**
     * Gets the Bot Client instance
     */
    readonly client: Client;

    /**
     * Gets the Mongo DB instance
     */
    readonly db: MongoDb;
}

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

    // The discord bot client
    private bot: Client;

    constructor(
        @inject(SERVICE.Luis) private luis: LuisService,
        @inject(SERVICE.MongoDb) private db: MongoDb
    ) {
        const bot = this.bot = new Client();
        bot.on("ready", () => {
            console.log(`Logged in as ${bot.user.tag}!`);
            console.log(`Output to: ${process.env.CHANNEL_ID}`);
        });
        bot.on("message", (msg) => this.onMessage({
            msg,
            client: bot,
            db
        }));
        bot.login(process.env.DISCORD_TOKEN);
    }

    /**
     * @inheritdoc
     */
    getBot(): Client {
        return this.bot;
    }

    /**
     * Subscribe to a message for reaction then push the result to database
     *
     * @param msg
     * @param time
     */
    async subscribeToMessage(msg: Message, time: number): Promise<void> {
        const filter = (reaction: MessageReaction, user: User): boolean => {
            return [OK_REACTION, DECLINE_REACTION].includes(reaction.emoji.name) && user.id === msg.author.id;
        };

        await msg.awaitReactions(filter, { max: 5, time });
        const { reactions } = msg;
        const responded = reactions
            .resolve(OK_REACTION)
            .users.cache.size - 1;
        const declined = reactions
            .resolve(DECLINE_REACTION)
            .users.cache.size - 1;
        await this.db.getStatuses().findOneAndUpdate({
            name: NERUKO_NAME,
        }, {
            $set: {
                lastAnnounce: {
                    id: msg.id,
                    responded,
                    declined,
                    purpose: ANNOUNCE_PURPOSE_TW_ONBOARD
                }
            }
        });
    }

    /**
     * Handles message received from discord
     *
     * @param options
     */
    @guard(
        notMe,
        contentNotEmpty
    )
    @command({ prefix: REPLY_COMMAND }, nrkReply)
    @fixedCommand({ command: BOOST_REGISTER_COMMAND }, boostRegister)
    @fixedCommand({ command: BOOST_UNREGISTER_COMMAND }, boostUnregister)
    @fixedCommand({ command: NERUKO_REGISTER_COMMAND }, nrkRegister)
    @fixedCommand({ command: NICKNAME_RESET_COMMAND }, nrkNickReset)
    @nitro()
    private async onMessage(options: MessageHandlerArguments): Promise<void> {
        const { msg, client } = options;
        if (!ANALYZE_LIST.some((text) => msg.content.includes(text))) {
            return;
        }

        const result = await this.luis.predictDiscordAsync(msg);

        // Handle the intent
        await INTENT_HANDLER[result.prediction.topIntent](msg);

        // Output debug message
        const reply = buildDebugMessage(result, msg);
        if (reply === null) { return; } // Do not register None intents
        const channel = await client.channels.fetch(process.env.HOME_CHANNEL_ID) as TextChannel;
        channel.send(reply);
    }
}
