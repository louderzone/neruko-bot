import { MessageHandlerArguments } from "discord/bot.service";

/**
 * Checks if the user is not the bot herself
 *
 * @param msg
 * @param client
 */
export function contentNotEmpty(args: MessageHandlerArguments): boolean {
    const { content } = args.msg;
    return content !== ""
        && content !== undefined
        && content !== null;
}
