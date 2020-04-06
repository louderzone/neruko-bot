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
        descriptor.value = async function(args): Promise<void> {
            if (args.msg.content.startsWith(options.prefix)) {
                return fn.apply(this, arguments);
            }
            return method.apply(this, arguments);
        };
    };
}

/**
 * Decorator for fixed commands declaration
 *
 * Route the existing method to a targeted method
 * according to the command options
 *
 * @param options The criteria for a command to be routed
 * @param fn The target method to execute
 */
export function fixedCommand(
    options: FixedCommandOptions,
    fn: DiscordMessageHandler
    ) {
        return (
            target: object,
            propertyKey: string,
            descriptor: TypedPropertyDescriptor<DiscordMessageHandler>
        ): void => {
            const method = descriptor.value;
            descriptor.value = async function(args): Promise<void> {
                if (args.msg.content === options.command) {
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
    /**
     * Gets or sets the command prefix
     *
     * Prefixed commands allows extra parameters
     * to be provided to the command.
     * However will override any text after that and
     * prevent predecessors from getting the request.
     */
    prefix: string;
}

/**
 * Represents options available for a fixed command to be routed
 */
interface FixedCommandOptions {
    /**
     * Gets or sets the fixed command
     *
     * Fixed commands are strictly compared by text
     * with not tolerance to extra parameters or spaces
     */
    command: string;
}
