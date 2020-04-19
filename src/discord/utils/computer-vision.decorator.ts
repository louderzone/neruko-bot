import { promisify } from "bluebird";
import { MessageEmbed } from "discord.js";
import { imageHash } from "image-hash";
import { Collection } from "mongodb";
import { PrImage } from "../../database/models/pr-image";
import { DiscordMessageHandler, MessageHandlerArguments } from "../bot.service";

const imageHashAsync = promisify(imageHash);

/**
 * Creates a perceptual hash for the image
 * for finding duplicated images in the database
 *
 * @param url
 */
async function hashImage(url: string): Promise<string> {
    const hashUrl = url.match(/.+?(?<=png|jpg|bmp)/);
    if (hashUrl === null) { return undefined; } // Only accept png/jpg/bmp

    try {
        return await imageHashAsync(hashUrl[0], 16, true) as string;
    } catch {
        // If hash fail, returns nothing
        return null;
    }
}

/**
 * Checks if the image with the same perceptual hash
 * already exists in the database
 *
 * @param hash The pHash of the image
 * @param collection
 */
async function imageExists(
    hash: string,
    collection: Collection<PrImage>
): Promise<boolean> {
    if (hash === null) { return true; } // Cannot hash this image, discard it

    const result = await collection.findOne({
        hash
    });
    return result !== null;
}

/**
 * Analyze embedded images in the message (most likely from
 * an external link such as twitter) and saves the result to
 * the database
 *
 * @param embeds
 * @param args
 */
async function recordEmbedded(
    embeds: MessageEmbed[],
    args: MessageHandlerArguments
): Promise<void> {
    if (embeds.length === 0) { return; } // Nothing embedded ignore

    const imageCollection = args.db.getPrImages();
    const promises = embeds.map<Promise<PrImage>>(async (e) => {
        if (e?.image?.url === undefined) { return undefined; } // If the embedded message does not have an image (?)

        const { url } = e.image;

        // Checks image hash
        const hash = await hashImage(url);
        // Checks if same image exists in the collection
        if (await imageExists(hash, imageCollection)) { return undefined; }

        try {
            const vision = await args.computerVision.describeImageAsync(url);
            return {
                url,
                vision,
                hash
            };
        } catch (e) {
            console.log(e);
            // If computer API failed in any ways, ignore that image
            // Catch the exception here such that it doesn't crash the whole stack
            // successful images can continue to be inserted
            return undefined;
        }
    });

    const visionResults = await Promise.all(promises);
    const prImages = visionResults.filter((r) => r !== undefined);
    if (prImages.length > 0) {
        // Adds to the database
        await imageCollection.insertMany(prImages);
    }
}

/**
 * Decorator for computer vision service
 *
 * Computer vision is a middleware that scans images in a message
 * and categorize them for the image database
 *
 * @param options The criteria for a command to be routed
 * @param booster The target method to execute
 */
export function computerVision() {
    return (
        target: object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<DiscordMessageHandler>
    ): void => {
        const method = descriptor.value;
        descriptor.value = async function(args): Promise<void> {
            const { embeds } = args.msg;
            try {
                await recordEmbedded(embeds, args);
            } catch (e) {
                console.log(e);
                // Continue to whatever should be happening in case of error
                // We don't care about the result, but the functions must work
            }
            return method.apply(this, arguments);
        };
    };
}
