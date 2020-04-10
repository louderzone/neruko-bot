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
        const { author, channel, content, guild, member} = msg;
        let replyText = content;
        const emojisFound = content.match(this.emojiSearch);
        const uniqueEmoji = emojisFound.filter((elem, pos) => {
            return emojisFound.indexOf(elem) === pos;
        });

        let changed = false;
        uniqueEmoji.forEach((emoteString) => {
            const name = emoteString.replace(/:/g, "");
            const emoji = guild.emojis.cache.find((e) => e.name === name);
            if (emoji === undefined) { return; } // Do nothing if emoji not in cache

            changed = true;
            const emoteRegex = new RegExp(emoteString, "g");
            replyText = replyText.replace(
                emoteRegex,
                emoji.toString()
            );
        });

        if (changed === false) { return; } // Do nothing is no emoji is actually replaced

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
