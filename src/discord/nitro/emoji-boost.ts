import { MessageEmbed } from "discord.js";
import { DiscordMessageHandler, MessageHandlerArguments } from "../../discord/bot.service";
import { emoteGex, replaceEmoji } from "../../utils/emoji-replace";
import { NitroBoosterInterface } from "./nitro-booster-interface";

/**
 * Booster implementation for Emoji function
 *
 * The booster virtually Nitro boosts a member without paying
 * Allowing them to use stickers not permitted without Nitro boost
 */
export class EmojiBooster implements NitroBoosterInterface {
    /**
     * @inheritdoc
     */
    func: DiscordMessageHandler = async (args) => {
        const { msg } = args;
        const { author, channel, content, guild, member} = msg;

        const replyText = replaceEmoji(content, guild.emojis);
        if (replyText === content) { return; } // Do nothing if no emoji is actually replaced

        // Pretends to be the user
        await guild.me.setNickname(member.displayName, "speak as user");

        msg.delete();
        await channel.send(`${replyText}`, new MessageEmbed({
            color: member.displayColor || 13956093,
            description: `<@${author.id}>`
        }));

        // Setting the nickname back to original
        await guild.me.setNickname("", "cleanup speak as");
    }

    /**
     * @inheritdoc
     */
    async isApplicableAsync(args: MessageHandlerArguments): Promise<boolean> {
        // Checks if the emoji
        const emojisFound = args.msg.content.match(emoteGex);
        return emojisFound !== null;
    }

    /**
     * @inheritdoc
     */
    async isActiveAsync(args: MessageHandlerArguments): Promise<boolean> {
        return await args.db.getUsers()
            .findOne({
                _id: args.msg.author.id,
                boosted: true
            }) !== null;
    }
}
