import { Client, Message } from "discord.js";
import { DiscordMessageHandler } from "./bot.service";

/**
 * Represents a guard function
 */
type Func = (msg: Message, client: Client) => boolean;

/**
 * Decorator for guarding a message from being processed
 * when a message is received from Discord
 *
 * @param fn Functions to test what to guard against
 */
export function guard(...fn: Func[]) {
    return (
        target: object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<DiscordMessageHandler>
    ): void => {
        const method = descriptor.value;
        descriptor.value = function(msg: Message, client: Client): void {
            if (!fn.every((check) => check(msg, client))) {
                return null;
            }
            return method.apply(this, arguments);
        };
    };
}
