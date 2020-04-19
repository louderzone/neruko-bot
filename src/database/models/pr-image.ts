import { ComputerVisionModels } from "@azure/cognitiveservices-computervision";

/**
 * Represents a Pr Image object that saves in the database
 */
export class PrImage {
    /**
     * Gets the URL of the image
     */
    url: string;

    /**
     * Gets the computer vision result
     * of the image
     */
    vision: ComputerVisionModels.AnalyzeImageResponse;

    /**
     * Gets the 16-bit hash of the image
     *
     * The hash is used for collision detection
     */
    hash: string;
}
