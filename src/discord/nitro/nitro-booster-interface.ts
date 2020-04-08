import { DiscordMessageHandler, MessageHandlerArguments } from "../../discord/bot.service";

/**
 * Represents the requirements for implementing a Nitro Booster interface
 */
export interface NitroBoosterInterface {
    /**
     * The boost function to perform on the message
     */
    func: DiscordMessageHandler;

    /**
     * Checks if the boost is applicable to this message
     *
     * This checks if the discord message matches the criteria to use this boost
     * This is different from the Active rule.
     *
     * @param args
     */
    isApplicableAsync(args: MessageHandlerArguments): Promise<boolean>;

    /**
     * Gets if the user has enabled this boost
     *
     * This checks if the user's preference to use or not to use this rule.
     * This is different from the Applicable rule.
     *
     * @param args
     */
    isActiveAsync(args: MessageHandlerArguments): Promise<boolean>;
}
