import "reflect-metadata";
import { BotBase } from "./message.handler";
import { Client } from "discord.js";
import { buildProviderModule, fluentProvide } from "inversify-binding-decorators";
import { SERVICE } from "../constants/services";
import { container } from "../inversify.config";

/**
 * Represents the Neruko bot instance
 */
@fluentProvide(SERVICE.Bot)
    .inSingletonScope()
    .done()
export class Neruko extends BotBase {

    private bot: Client;

    constructor() {
        super();

        const bot = this.bot = new Client();
        bot.on("ready", () => {
            console.log(`Logged in as ${bot.user.tag}!`);
            console.log(`Output to: ${process.env.CHANNEL_ID}`);
        });
        bot.on("message", this.discordOnMessage);
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
