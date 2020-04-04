import { Client } from "discord.js";
import { inject } from "inversify";
import { buildProviderModule, fluentProvide } from "inversify-binding-decorators";
import "reflect-metadata";
import { PROVIDER } from "../constants/providers";
import { SERVICE } from "../constants/services";
import { container } from "../inversify.config";
import { LuisRecognizerProvider } from "../luis/luis.provider";
import { discordOnMessage } from "./message.handler";

/**
 * Represents the Neruko bot instance
 */
@fluentProvide(SERVICE.Bot)
    .inSingletonScope()
    .done()
export class Neruko {

    private bot: Client;

    constructor(
        @inject(PROVIDER.LuisRecognizer) private luisProvider: LuisRecognizerProvider
    ) {
        const bot = this.bot = new Client();
        bot.on("ready", () => {
            console.log(`Logged in as ${bot.user.tag}!`);
            console.log(`Output to: ${process.env.CHANNEL_ID}`);
        });
        bot.on("message", (msg) => discordOnMessage(bot, msg, this.luisProvider));
        // Make sure Discord bot is logged in before anything.
        bot.login(process.env.DISCORD_TOKEN);
    }

    /**
     * Gets the discord bot instance
     */
    getBot(): Client {
        return this.bot;
    }
}

container.load(buildProviderModule());
