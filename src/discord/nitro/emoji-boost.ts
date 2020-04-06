import { RichEmbed } from "discord.js";
import { DiscordMessageHandler, MessageHandlerArguments } from "discord/bot.service";
import { NitroBoosterInterface } from "./nitro-booster-interface";

export class EmojiBooster implements NitroBoosterInterface {
    /**
     * The rule to search for an emoji
     */
    private emojiSearch = /(?<!<):([A-z0-9-_]+):/g;

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
            const emoji = msg.guild.emojis.find((e) => e.name === name);
            replyText = replyText.replace(emoteString, emoji.toString());
        });
        msg.delete();
        msg.channel.send(`${replyText}`, new RichEmbed({
            color: 13956093,
            description: `<@${author.id}>`
        }));
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
        return await args.db.getUsers().findOne({ _id: "329960570076004353", boosted: true }) !== null;
    }
}
