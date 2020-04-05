import { Client, Message } from "discord.js";
import { DiscordMessageHandler } from "./bot.service";

/**
 * Decorator for guarding a message from being processed
 * when a message is received from Discord
 *
 * @param fn Functions to test what to guard against
 */
export function command() {
    return (
        target: object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<DiscordMessageHandler>
    ): void => {
        const method = descriptor.value;
        descriptor.value = function(msg: Message, client: Client): void {
            return method.apply(this, arguments);
        };
    };
}
