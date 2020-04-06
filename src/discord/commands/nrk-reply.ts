import { Message } from "discord.js";

export const REPLY_COMMAND = "/nrk:reply ";

/**
 * Handles when /nrk:reply command is received
 *
 * @param msg The discord message received
 */
export async function nrkReply(msg: Message): Promise<void> {
    msg.delete();
    await msg.channel.send(msg.content.substring(REPLY_COMMAND.length));
}
