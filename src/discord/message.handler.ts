import { Message, Client, Collection, TextChannel } from "discord.js";
import { LuisRecognizerProvider } from "../luis/luis.provider";
import { PredictionGetSlotPredictionResponse, PredictionRequest } from "@azure/cognitiveservices-luis-runtime/esm/models";

const REPLY_COMMAND = "/nrk:reply ";

const appId = process.env.LUIS_APP_ID;
const slotName = process.env.LUIS_SLOT_NAME;
const verbose = true;
const showAllIntents = true;

/**
 * List of intents supported by the LUIS model
 */
const INTENT_NAME = {
    rankRun: "打排名",
    dd: "當DD",
    default: "None"
}

/**
 * Gets the message about mentioned runners
 *
 * @param msg The discord message
 * @param defaultMessage The default message if no one is mentioned
 */
function getMentionedRunners(msg: Message, defaultMessage: string): string {
    return msg.mentions.members.size === 0 ?
        defaultMessage :
        msg.mentions.members.map(m => `<@${m.id}>`).join(" ");
}

/**
 * Creates the runner name according to who is mentioned as the runner in the context
 */
const RUNNER_NAME = {
    "你": (msg: Message): string => getMentionedRunners(msg, "誰？？？"),
    "我": (msg: Message): string => `<@${msg.author.id}>`,
    "default": (msg: Message, name?: string): string => name 
        || getMentionedRunners(msg, `<@${msg.author.id}>`) // No one is mentioned, and not talking about the user, is probably the author
}

/**
 * Gets the runner name according to the context
 * 
 * @param runnerContext The entity back from LUIS
 * @param msg The discord message
 */
function getRunnerName(runnerContext: string[], msg: Message): string {
    if (runnerContext === undefined 
        || runnerContext.length === 0) {
        return RUNNER_NAME.default(msg);
    }
    return (RUNNER_NAME[runnerContext[0]] || RUNNER_NAME.default)(msg, runnerContext[0]);
}

/**
 * Gets the prediction request object
 * 
 * The method polish the discord message to
 * remove quotes, special characters and mentions
 * to improve the prediction result
 * 
 * @param msg The full discord message object
 */
function getPredictionRequest(msg: Message): PredictionRequest {
    const query = msg.content
        .split(/\r?\n/) // Split each line
        .filter(m => !m.startsWith(">")) // Ignore quotes
        .join(", "); // Comma separate each sentence to improve prediction quality
    return { query };
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

    // Build the text
    const { eventName, topRank, runner } = response.prediction.entities;
    const intentText = `${getRunnerName(runner, msg)}想\`${intentName}\``;
    const eventText = eventName === undefined ? "" : `活動：${eventName.join(", ")}`;
    const topRankText = topRank === undefined ? "" : `排名：${topRank[0]}`;
    const scoreText = `(Score: ${response.prediction.intents[topIntent].score})`;

    // Output the analyze result
    const debugMessage = `\`\`\`Triggered:${msg.content}\r\n${eventText}\r\n${topRankText}\`\`\``;
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
    const predictionRequest = getPredictionRequest(msg);
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
