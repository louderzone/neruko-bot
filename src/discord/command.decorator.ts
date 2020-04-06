import { DiscordMessageHandler } from "./bot.service";

/**
 * Decorator for commands declaration
 *
 * Route the existing method to a targeted method
 * according to the command options
 *
 * @param options The criteria for a command to be routed
 * @param fn The target method to execute
 */
export function command(options: CommandOptions, fn: DiscordMessageHandler) {
    return (
        target: object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<DiscordMessageHandler>
    ): void => {
        const method = descriptor.value;
        descriptor.value = function(args): void {
            if (args.msg.content.startsWith(options.prefix)) {
                return fn.apply(this, arguments);
            }
            return method.apply(this, arguments);
        };
    };
}

/**
 * Represents options available for a command to be routed
 */
interface CommandOptions {
    prefix: string;
}
