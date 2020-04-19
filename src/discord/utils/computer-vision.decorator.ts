import { promisify } from "bluebird";
import { MessageAttachment, MessageEmbed } from "discord.js";
import { Collection as DcCollection } from "discord.js";
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
async function imageExistsAsync(
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
 * Applies computer vision to the image
 *
 * @param url The url of the image
 * @param args
 */
async function describeImageAsync(
    url: string,
    args: MessageHandlerArguments
): Promise<PrImage> {
    // Checks image hash
    const hash = await hashImage(url);
    // Checks if same image exists in the collection
    if (await imageExistsAsync(hash, args.db.getPrImages())) {
        return undefined;
    }

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
}

/**
 * Analyze embedded images in the message (most likely from
 * an external link such as twitter)
 *
 * @param embeds
 * @param args
 */
async function recordEmbeddedAsync(
    embeds: MessageEmbed[],
    args: MessageHandlerArguments
): Promise<PrImage[]> {
    if (embeds.length === 0) { return []; } // Nothing embedded ignore

    const promises = embeds.map<Promise<PrImage>>(async (e) => {
        if (e?.image?.url === undefined) { return undefined; } // If the embedded message does not have an image (?)
        return await describeImageAsync(e.image.url, args);
    });

    const visionResults = await Promise.all(promises);
    return visionResults.filter((r) => r !== undefined) ?? [];
}

/**
 * Analyze image attachments in the message
 *
 * @param attachments
 * @param args
 */
async function recordAttachmentsAsync(
    attachments: DcCollection<string, MessageAttachment>,
    args: MessageHandlerArguments
): Promise<PrImage[]> {
    if (attachments.size === 0) { return []; } // Nothing embedded ignore

    const promises = attachments.map<Promise<PrImage>>(async (a) => {
        return await describeImageAsync(a.url, args);
    });

    const visionResults = await Promise.all(promises);
    return visionResults.filter((r) => r !== undefined) ?? [];
}

/**
 * Inserts the recognition results to the database
 *
 * @param prImages
 * @param args
 */
async function insertImagesAsync(
    prImages: PrImage[],
    args: MessageHandlerArguments
): Promise<void> {
    if (prImages.length > 0) {
        // Adds to the database
        await args.db.getPrImages()
            .insertMany(prImages);
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
            const { embeds, attachments } = args.msg;
            try {
                const embeddedPrImages = await recordEmbeddedAsync(embeds, args);
                const attachedPrImages = await recordAttachmentsAsync(attachments, args);
                insertImagesAsync([
                    ...embeddedPrImages,
                    ...attachedPrImages
                ], args);
            } catch (e) {
                console.log(e);
                // Continue to whatever should be happening in case of error
                // We don't care about the result, but the functions must work
            }
            return method.apply(this, arguments);
        };
    };
}
