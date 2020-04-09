import { MessageHandlerArguments } from "../../discord/bot.service";

export const NICKNAME_RESET_COMMAND = "/nrk:nick reset";

/**
 * Handles when /nrk:nick reset command is received
 *
 * Resets neruko's display name
 *
 * @param args
 */
export async function nrkNickReset(args: MessageHandlerArguments): Promise<void> {
    await args.msg.guild.me.setNickname("");
}
