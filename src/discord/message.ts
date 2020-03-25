import { Message } from "discord.js";

const REPLY_COMMAND = "/nrk:reply ";

/**
 * Handles when someone send a message on the discord group
 *
 * @param msg 
 */
export async function discordOnMessage(msg: Message): Promise<void> {
    if (msg.content.startsWith(REPLY_COMMAND)) {
        msg.delete();
        await msg.channel.send(msg.content.substring(REPLY_COMMAND.length));
    }
}
