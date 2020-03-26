import { container } from "../inversify.config";
import { LuisRecognizer } from 'botbuilder-ai';
import { PROVIDER } from "../constants/providers";

/**
 * Creates the instance of luis recognizer
 */
const luisRecognizer = new LuisRecognizer({
    applicationId: process.env.LUIS_APP_ID,
    endpointKey: process.env.LUIS_AUTHORING_KEY,
    endpoint: process.env.LUIS_END_POINT
});

/**
 * Provide LUIS Recognizer in singleton manner
 */
function provideLuisRecognizer() {
    return (): Promise<LuisRecognizer> => {
        return new Promise<LuisRecognizer>(async () => {
            return luisRecognizer
        });
    }
}

container.bind<LuisRecognizerProvider>(PROVIDER.LuisRecognizer)
    .toProvider<LuisRecognizer>(provideLuisRecognizer);

export type LuisRecognizerProvider = () => Promise<LuisRecognizer>;
