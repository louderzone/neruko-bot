import { MessageHandlerArguments } from "../../discord/bot.service";

export const REPLY_COMMAND = "/nrk:reply ";

/**
 * Handles when /nrk:reply command is received
 *
 * @param args The handler arguments
 */
export async function nrkReply(args: MessageHandlerArguments): Promise<void> {
    const { msg } = args;
    msg.delete({
        reason: "Speak as bot command"
    });
    await msg.channel.send(msg.content.substring(REPLY_COMMAND.length));
}
