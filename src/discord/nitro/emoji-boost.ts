import { MessageEmbed } from "discord.js";
import { DiscordMessageHandler, MessageHandlerArguments } from "../../discord/bot.service";
import { NitroBoosterInterface } from "./nitro-booster-interface";

/**
 * Booster implementation for Emoji function
 *
 * The booster virtually Nitro boosts a member without paying
 * Allowing them to use stickers not permitted without Nitro boost
 */
export class EmojiBooster implements NitroBoosterInterface {
    /**
     * The rule to search for an emoji
     */
    private emojiSearch = /(?<!<)(?<!<a):([A-z0-9-_]+):/g;

    /**
     * @inheritdoc
     */
    func: DiscordMessageHandler = async (args) => {
        const { msg } = args;
        const { content, author } = msg;
        let replyText = content;
        const emojisFound = content.match(this.emojiSearch);
        emojisFound.forEach((emoteString) => {
            const name = emoteString.replace(/:/g, "");
            const emoji = msg.guild.emojis.cache.find((e) => e.name === name);
            replyText = replyText.replace(emoteString, emoji.toString());
        });

        // Pretends to be the user
        const whoami = msg.guild.me.nickname;
        await msg.guild.me.setNickname(msg.member.nickname, "speak as");

        msg.delete();
        await msg.channel.send(`${replyText}`, new MessageEmbed({
            color: msg.member.displayColor,
            description: `<@${author.id}>`
        }));

        // Setting the nickname back to original
        await msg.guild.me.setNickname(whoami, "cleanup speak as");
    }

    /**
     * @inheritdoc
     */
    async isApplicableAsync(args: MessageHandlerArguments): Promise<boolean> {
        // Checks if the emoji
        const searchForEmojis = this.emojiSearch;
        const emojisFound = args.msg.content.match(searchForEmojis);
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
