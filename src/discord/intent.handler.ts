import { Message } from "discord.js";

/**
 * Defines an intent handler
 */
type IntentHandler = (msg: Message) => Promise<void>;

/**
 * Handles the request when a rank running intent is detected
 *
 * @param msg The discord message context
 */
async function rankRunOnDetected(msg: Message): Promise<void> {
    msg.react("🚩");
}

/**
 * Handles the request when a dd intent is detected
 *
 * @param msg The discord message context
 */
async function ddOnDetected(msg: Message): Promise<void> {
    msg.react(msg.guild.emojis.get("690157951310102583"));
}

/**
 * List of intents supported by the LUIS model
 */
export const INTENT_HANDLER: { [key: string]: IntentHandler } = {
    rankRun: rankRunOnDetected,
    dd: ddOnDetected,
    None: async (): Promise<void> => { return; } // Do nothing
};
