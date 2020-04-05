import { Client, Message } from "discord.js";

/**
 * Checks if the user is not the bot herself
 *
 * @param msg
 * @param client
 */
export function notMe(msg: Message, client: Client): boolean {
    return msg.author.id !== client.user.id;
}
