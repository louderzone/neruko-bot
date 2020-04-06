import { User } from "database/models/user";
import { Message } from "discord.js";
import { MessageHandlerArguments } from "discord/bot.service";
import { Collection, FindAndModifyWriteOpResultObject } from "mongodb";

/**
 * The command for registering boost on a user
 */
export const BOOST_REGISTER_COMMAND = "/n+";

/**
 * The command for de-registering boost on a user
 */
export const BOOST_UNREGISTER_COMMAND = "/n-";

/**
 * Sets the boosted status of the discord user in database
 *
 * @param users The MongoDB user collection
 * @param boosted Sets the user to boosted or not boosted
 * @param msg The discord message object
 */
async function setBoost(
    users: Collection<User>,
    boosted: boolean,
    msg: Message
): Promise<FindAndModifyWriteOpResultObject<User>> {
    return users.findOneAndUpdate({
        _id: msg.author.id
    }, {
        $set: { boosted },
        $setOnInsert: { _id: msg.author.id }
    }, {
        returnOriginal: true,
        upsert: true
    });
}

/**
 * Handles when boost register command is received
 *
 * @param msg The discord message received
 */
export async function boostRegister(args: MessageHandlerArguments): Promise<void> {
    const { msg, db } = args;
    const users = db.getUsers();
    await setBoost(users, true, msg);
    // Notify user that the operation is completed successfully
    await msg.react("👌🏻");
}

/**
 * Handles when boost register command is received
 *
 * @param msg The discord message received
 */
export async function boostUnregister(args: MessageHandlerArguments): Promise<void> {
    const { msg, db } = args;
    const users = db.getUsers();
    await setBoost(users, false, msg);
    // Notify user that the operation is completed successfully
    await msg.react("🥺");
}
