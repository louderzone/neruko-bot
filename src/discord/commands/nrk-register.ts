import { MessageHandlerArguments, NERUKO_NAME } from "../../discord/bot.service";

export const NERUKO_REGISTER_COMMAND = "/nrk:register";

/**
 * Handles when /nrk:register command is received
 *
 * @param args The handler arguments
 */
export async function nrkRegister(args: MessageHandlerArguments): Promise<void> {
    // Register bot on first start
    await args.db.getStatuses().findOneAndUpdate({
        name: NERUKO_NAME
    }, {
        $setOnInsert: {
            id: args.client.user.tag,
            name: NERUKO_NAME
        }
    }, {
        upsert: true
    });
    await args.msg.react("🥰");
}
