import { Emoji, GuildEmojiManager } from "discord.js";
import { KeyValueObject } from "../misc/key-value-pair";
import { notUndefined } from "./filters/not-undefined-filter";

/**
 * Represents the regex for pattern matching discord emoji string
 */
export const emoteGex = /(?<!<)(?<!<a):([A-z0-9-_]+):/g;

/**
 * Replace a string with emoji with the metadata emoji for echo in discord
 *
 * @param message
 * @param emojiCollection
 */
export function replaceEmoji(message: string, emojiManager: GuildEmojiManager): string {
    const emojisFound = message.match(emoteGex);

    // Find unique emojis to avoid multiple replacements on single emoji
    const uniqueEmoji = emojisFound.filter((elem, pos) => {
        return emojisFound.indexOf(elem) === pos;
    });

    if (uniqueEmoji.length === 0) { return message; } // No emoji found, return original string

    const findEmojis = uniqueEmoji.map<KeyValueObject<Emoji>>((emojiString) => {
        const name = emojiString.replace(/:/g, "");
        const value = emojiManager.cache.find((e) => e.name === name);
        return {
            id: emojiString,
            value
        };
    });

    const emojiPairs = findEmojis.filter(notUndefined);
    // Replace each emoji text from cache
    emojiPairs.forEach((obj) => {
        const { id, value } = obj;
        const emoteRegex = new RegExp(id, "g");
        message = message.replace(
            emoteRegex,
            value.toString()
        );
    });

    return message;
}
