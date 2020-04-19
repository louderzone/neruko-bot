import {
    ComputerVisionClient,
    ComputerVisionModels
} from "@azure/cognitiveservices-computervision";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { fluentProvide } from "inversify-binding-decorators";
import { SERVICE } from "../constants/services";

@fluentProvide(SERVICE.ComputerVision)
    .inSingletonScope()
    .done()
export class ComputerVisionService {

    private client: ComputerVisionClient;

    constructor() {
        const computerVisionKey = process.env.COMPUTER_VISION_KEY;
        const computerVisionEndPoint =
            process.env.COMPUTER_VISION_ENDPOINT;
        const cognitiveServiceCredentials = new CognitiveServicesCredentials(computerVisionKey);
        this.client = new ComputerVisionClient(cognitiveServiceCredentials, computerVisionEndPoint);
    }

    /**
     * Predicts the intent of a Discord message
     *
     * @param msg The discord message for prediction
     */
    async describeImageAsync(url: string): Promise<ComputerVisionModels.AnalyzeImageResponse> {
        const options: ComputerVisionModels.ComputerVisionClientAnalyzeImageOptionalParams = {
            visualFeatures: [
                "Adult",
                "Brands",
                "Categories",
                "Color",
                "Description",
                "Faces",
                "ImageType",
                "Objects",
                "Tags"
            ],
            details: [
                "Celebrities",
                "Landmarks"
            ]
        };
        return this.client.analyzeImage(url, options);
    }
}
