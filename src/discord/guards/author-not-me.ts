import { MessageHandlerArguments } from "discord/bot.service";

/**
 * Checks if the user is not the bot herself
 *
 * @param msg
 * @param client
 */
export function notMe(args: MessageHandlerArguments): boolean {
    const { msg, client } = args;
    return msg.author.id !== client.user.id;
}
