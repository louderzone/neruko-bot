import {
    PredictionGetSlotPredictionResponse
} from "@azure/cognitiveservices-luis-runtime/esm/models";
import { Message } from "discord.js";

/**
 * List of intents supported by the LUIS model
 */
const INTENT_NAME = {
    rankRun: "打排名",
    dd: "當DD",
    greeting: "問候",
    default: "None"
};

/**
 * Gets the message about mentioned runners
 *
 * @param msg The discord message context
 * @param defaultMessage The default message if no one is mentioned
 */
function getMentionedRunners(msg: Message, defaultMessage: string): string {
    return msg.mentions.members.size === 0 ?
        defaultMessage :
        msg.mentions.members.map((m) => `${m.user.tag}`).join(" ");
}

/**
 * Creates the runner name according to who is mentioned as the runner in the context
 */
const RUNNER_NAME = {
    你: (msg: Message): string => getMentionedRunners(msg, "誰？？？"),
    我: (msg: Message): string => `${msg.author.tag}`,
    default: (msg: Message, name?: string): string => name
        || getMentionedRunners(msg, `${msg.author.tag}`) // No one is mentioned,
                                                         // and not talking about the user, is probably the author
};

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
 * Creates the debug message for LUIS detection
 *
 * @param response
 */
export function buildDebugMessage(response: PredictionGetSlotPredictionResponse, msg: Message): string {
    const { topIntent, entities, intents }  = response.prediction;
    const intentName = INTENT_NAME[topIntent] || INTENT_NAME.default;
    if (intentName === INTENT_NAME.default) { return null; }

    // Build the text
    const { eventName, topRank, runner } = entities;
    const intentText = `${getRunnerName(runner, msg)}想\`${intentName}\``;
    const scoreText = `(Score: ${intents[topIntent].score})`;

    // Debug messages
    const eventText = eventName === undefined ? "" : `活動：${eventName.join(", ")}\r\n`;
    const topRankText = topRank === undefined ? "" : `排名：${topRank[0]}\r\n`;
    const intentsText = Object.keys(intents)
        .map((i) => `${INTENT_NAME[i] || INTENT_NAME.default}: (${intents[i].score})`).join("\r\n");

    // Output the analyze result
    const debugMessage = `\`\`\`Triggered:${msg.content}\r\n${eventText}${topRankText}\r\n`
        + `意向\r\n=====\r\n${intentsText}\`\`\``;
    return `${intentText} ${scoreText}\r\n${debugMessage}`;
}
