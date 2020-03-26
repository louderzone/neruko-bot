import { Message } from "discord.js";
import { injectable, inject } from "inversify";
import { PROVIDER } from "../constants/providers";
import { LuisRecognizerProvider } from "../luis/luis.provider";

const REPLY_COMMAND = "/nrk:reply ";

@injectable()
export class BotBase {
    @inject(PROVIDER.LuisRecognizer) private _luisProvider: LuisRecognizerProvider

    /**
     * Handles when someone send a message on the discord group
     *
     * @param msg 
     */
    protected async discordOnMessage(msg: Message): Promise<void> {
        if (msg.content.startsWith(REPLY_COMMAND)) {
            msg.delete();
            await msg.channel.send(msg.content.substring(REPLY_COMMAND.length));
        }        
    }
}
