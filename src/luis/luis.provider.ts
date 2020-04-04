import { LUISRuntimeClient } from "@azure/cognitiveservices-luis-runtime";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { PROVIDER } from "../constants/providers";
import { container } from "../inversify.config";

const creds = new CognitiveServicesCredentials(process.env.LUIS_AUTHORING_KEY);
export const luisClient = new LUISRuntimeClient(creds, process.env.LUIS_ENDPOINT);

container.bind<LuisRecognizerProvider>(PROVIDER.LuisRecognizer)
    .toProvider<LUISRuntimeClient>(() => {
        return (): Promise<LUISRuntimeClient> => {
            return new Promise<LUISRuntimeClient>((resolve) => {
                resolve(luisClient);
            });
        };
    });

export type LuisRecognizerProvider = () => Promise<LUISRuntimeClient>;
