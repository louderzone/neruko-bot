import { MessageEmbed } from "discord.js";
import { PrImage } from "../../database/models/pr-image";
import { DiscordMessageHandler, MessageHandlerArguments } from "../bot.service";

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
        const vision = await args.computerVision.describeImageAsync(url);
        return {
            url,
            vision
        };
    });
    const prImages = await Promise.all(promises);
    await imageCollection.insertMany(prImages);
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
