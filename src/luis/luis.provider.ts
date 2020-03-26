import { container } from "../inversify.config";
import { PROVIDER } from "../constants/providers";
import Luis = require("luis-sdk-async");

/**
 * Creates the instance of luis recognizer
 */
const luisRecognizer = new Luis(
    process.env.LUIS_APP_ID,
    process.env.LUIS_AUTHORING_KEY,
    process.env.LUIS_END_POINT
);

/**
 * Provide LUIS Recognizer in singleton manner
 */
function provideLuisRecognizer() {
    return (): Promise<Luis> => {
        return new Promise<Luis>(async () => {
            return luisRecognizer
        });
    }
}

container.bind<LuisRecognizerProvider>(PROVIDER.LuisRecognizer)
    .toProvider<Luis>(provideLuisRecognizer);

export type LuisRecognizerProvider = () => Promise<Luis>;
