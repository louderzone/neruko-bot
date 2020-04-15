import { MessageHandlerArguments } from "../../discord/bot.service";
import { replaceEmoji } from "../../utils/emoji-replace";

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
    let content = msg.content.substring(REPLY_COMMAND.length);
    content = replaceEmoji(content, msg.guild.emojis);
    await msg.channel.send(content);
}
