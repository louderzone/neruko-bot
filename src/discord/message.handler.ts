import { Message } from "discord.js";
import { LuisRecognizerProvider } from "../luis/luis.provider";

const REPLY_COMMAND = "/nrk:reply ";

const appId = process.env.LUIS_APP_ID;
const slotName = process.env.LUIS_SLOT_NAME;
const verbose = true;
const showAllIntents = true;

/**
 * Handles when a message is received from discord
 *
 * @param msg The discord message object
 * @param luisProvider The language understanding tool
 */
export async function discordOnMessage(msg: Message, luisProvider: LuisRecognizerProvider): Promise<void> {
    if (msg.content.startsWith(REPLY_COMMAND)) {
        msg.delete();
        await msg.channel.send(msg.content.substring(REPLY_COMMAND.length));
    } else {
        const predictionRequest = { query: msg.content };
        const client = await luisProvider();
        const result = await client
            .prediction
            .getSlotPrediction(appId, slotName, predictionRequest, { verbose, showAllIntents });
        console.log(result);
    }
}
