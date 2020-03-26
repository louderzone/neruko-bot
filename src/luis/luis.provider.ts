import { container } from "../inversify.config";
import { PROVIDER } from "../constants/providers";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { LUISRuntimeClient } from "@azure/cognitiveservices-luis-runtime";

const creds = new CognitiveServicesCredentials(process.env.LUIS_AUTHORING_KEY);
export const luisClient = new LUISRuntimeClient(creds, "https://australiaeast.api.cognitive.microsoft.com/");

/**
 * Provide LUIS Recognizer in singleton manner
 */
function provideLuisRecognizer() {
    return (): Promise<LUISRuntimeClient> => {
        return new Promise<LUISRuntimeClient>(async () => luisClient);
    }
}

container.bind<LuisRecognizerProvider>(PROVIDER.LuisRecognizer)
    .toProvider<LUISRuntimeClient>(() => {
        return () => {
            return new Promise<LUISRuntimeClient>((resolve) => {
                resolve(luisClient);
            })
        }
    });

export type LuisRecognizerProvider = () => Promise<LUISRuntimeClient>;
