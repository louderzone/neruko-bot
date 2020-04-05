import { Message } from "discord.js";

export const REPLY_COMMAND = "/nrk:reply ";

export async function nrkReply(msg: Message): Promise<void> {
    msg.delete();
    await msg.channel.send(msg.content.substring(REPLY_COMMAND.length));
}
