import { Message } from "discord.js";

/**
 * Checks if the user is not the bot herself
 *
 * @param msg
 * @param client
 */
export function contentNotEmpty(msg: Message): boolean {
    const { content } = msg;
    return content !== ""
        && content !== undefined
        && content !== null;
}
