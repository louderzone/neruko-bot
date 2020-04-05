import { LUISRuntimeClient } from "@azure/cognitiveservices-luis-runtime";
import {
    PredictionGetSlotPredictionResponse,
    PredictionRequest
} from "@azure/cognitiveservices-luis-runtime/esm/models";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { Message } from "discord.js";
import { fluentProvide } from "inversify-binding-decorators";
import { SERVICE } from "../constants/services";

const appId = process.env.LUIS_APP_ID;
const slotName = process.env.LUIS_SLOT_NAME;
const verbose = true;
const showAllIntents = true;
const log = false;

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
        .filter((m) => !m.startsWith(">")) // Ignore quotes
        .map((m) => m.replace(/~~|\|\|/g, "")) // Replace the encapsulations
                                             // as it seems to cause a lot of mistakes in luis
        .join(", "); // Comma separate each sentence to improve prediction quality
    return { query };
}

@fluentProvide(SERVICE.Luis)
    .inSingletonScope()
    .done()
export class LuisService {

    private client: LUISRuntimeClient;

    constructor() {
        const credentials = new CognitiveServicesCredentials(process.env.LUIS_AUTHORING_KEY);
        this.client = new LUISRuntimeClient(credentials, process.env.LUIS_ENDPOINT);
    }

    /**
     * Predicts the intent of a Discord message
     *
     * @param msg The discord message for prediction
     */
    async predictDiscordAsync(msg: Message): Promise<PredictionGetSlotPredictionResponse> {
        const predictionRequest = getPredictionRequest(msg);
        return this.client.prediction
            .getSlotPrediction(appId, slotName, predictionRequest, { verbose, showAllIntents, log });
    }
}
