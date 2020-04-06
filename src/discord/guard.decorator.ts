import { DiscordMessageHandler, MessageHandlerArguments } from "./bot.service";

/**
 * Represents a guard function
 */
type Func = (options: MessageHandlerArguments) => boolean;

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
        descriptor.value = async function(args): Promise<void> {
            if (!fn.every((check) => check(args))) {
                return null;
            }
            return method.apply(this, arguments);
        };
    };
}
