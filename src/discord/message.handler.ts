import { Message, Client, Collection, TextChannel } from "discord.js";
import { LuisRecognizerProvider } from "../luis/luis.provider";
import { PredictionGetSlotPredictionResponse } from "@azure/cognitiveservices-luis-runtime/esm/models";

const REPLY_COMMAND = "/nrk:reply ";

const appId = process.env.LUIS_APP_ID;
const slotName = process.env.LUIS_SLOT_NAME;
const verbose = true;
const showAllIntents = true;

const INTENT_NAME = {
    rankRun: "打排名",
    dd: "當DD",
    default: "None"
}

/**
 * Creates the debug message for LUIS detection
 *
 * @param response 
 */
function buildMessage(response: PredictionGetSlotPredictionResponse, msg: Message): string {
    const topIntent = response.prediction.topIntent;
    const intentName = INTENT_NAME[topIntent] || INTENT_NAME.default;
    if (intentName === INTENT_NAME.default) return null;

    const { eventName, topRank } = response.prediction.entities;

    const intentText = `<@${msg.author.id}> 想\`${intentName}\``;
    const eventText = eventName === undefined ? "" : `活動：${eventName.join(", ")}`;
    const topRankText = topRank === undefined ? "" : `排名：${topRank[0]}`;
    const scoreText = `(Score: ${response.prediction.intents[topIntent].score})`;

    const debugMessage = `\`\`\`\r\nTriggered:${msg.content}\r\n${eventText}\r\n${topRankText}\r\n\`\`\``;
    return `${intentText} ${scoreText}\r\n${debugMessage}`;
}

/**
 * Handles when a message is received from discord
 *
 * @param msg The discord message object
 * @param luisProvider The language understanding tool
 */
export async function discordOnMessage(
    context: Client,
    msg: Message,
    luisProvider: LuisRecognizerProvider
): Promise<void> {
    if (msg.author.id === context.user.id) {
        // Prevent from reading my own message
        return;
    }

    if (msg.content.startsWith(REPLY_COMMAND)) {
        msg.delete();
        await msg.channel.send(msg.content.substring(REPLY_COMMAND.length));
        return;
    }

    if (msg.content === "" || msg.content === undefined || msg.content === null) { return; } // Do not send if empty to save credits
    const predictionRequest = { query: msg.content };
    const client = await luisProvider();
    const result = await client
        .prediction
        .getSlotPrediction(appId, slotName, predictionRequest, { verbose, showAllIntents });
    const reply = buildMessage(result, msg);
    
    if (reply === null) return; // Do not register None intents
    const channels = context.channels as Collection<string, TextChannel>;
    const talkChannels =  channels.filter((c) => c.id === process.env.HOME_CHANNEL_ID);
        talkChannels.forEach(c => {
            c.send(reply);
        });
}
