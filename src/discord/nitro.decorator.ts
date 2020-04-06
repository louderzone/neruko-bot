import { findAsync } from "../utils/find-async";
import { DiscordMessageHandler } from "./bot.service";
import { EmojiBooster } from "./nitro/emoji-boost";

const NITRO_SERVICES = [new EmojiBooster()];

/**
 * Decorator for nitro declaration
 *
 * Route the request to virtually Nitro boost a user
 * according to the nitro options the user has subscribed
 *
 * @param options The criteria for a command to be routed
 * @param booster The target method to execute
 */
export function nitro() {
    return (
        target: object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<DiscordMessageHandler>
    ): void => {
        const method = descriptor.value;
        descriptor.value = async function(args): Promise<void> {
            const booster = await findAsync(
                NITRO_SERVICES,
                async (b) => (
                    await b.isApplicableAsync(args)
                    && await b.isActiveAsync(args)
                )
            );
            if (booster !== undefined) {
                // Finds a applicable Booster, route to the booster instead
                return booster.func.apply(this, arguments);
            }
            return method.apply(this, arguments);
        };
    };
}
