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
    const { id, tag: username } = msg.author;
    return users.findOneAndUpdate({
        _id: msg.author.id
    }, {
        $set: { boosted },
        $setOnInsert: {
            _id: id,
            username
        }
    }, {
        returnOriginal: true,
        upsert: true
    });
}

/**
 * Sets the boost setting and react to user after complete
 *
 * @param args Discord handler arguments
 * @param boosted Sets the user to boosted or not boosted
 * @param completedReaction Which emoji to react after complete
 */
async function boostSetter(
    args: MessageHandlerArguments,
    boosted: boolean,
    completedReaction: string
): Promise<void> {
    const { msg, db } = args;
    const users = db.getUsers();
    await setBoost(users, boosted, msg);
    // Notify user that the operation is completed successfully
    await msg.react(completedReaction);
}

/**
 * Handles when boost register command is received
 *
 * @param msg The discord message received
 */
export async function boostRegister(args: MessageHandlerArguments): Promise<void> {
    return boostSetter(args, true, "👌🏻");
}

/**
 * Handles when boost register command is received
 *
 * @param msg The discord message received
 */
export async function boostUnregister(args: MessageHandlerArguments): Promise<void> {
    return boostSetter(args, false, "🥺");
}
