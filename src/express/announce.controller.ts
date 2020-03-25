import { controller, BaseHttpController, httpPost, requestBody, interfaces } from "inversify-express-utils";
import { inject } from "inversify";
import { SERVICE } from "../constants/services";
import { Neruko } from "../discord/bot.service";
import { Collection, TextChannel } from "discord.js";

@controller("/announce")
export class AnnounceController extends BaseHttpController {
    constructor(@inject(SERVICE.Bot) private neruko: Neruko) {
        super();
     }

    @httpPost("/shift")
    private shift(
        @requestBody() body: any
    ): interfaces.IHttpActionResult {
        const channels = this.neruko.getBot().channels as Collection<string, TextChannel>;
        const talkChannels =  channels.filter((c) => c.id === body.cid);
        talkChannels.forEach(c => {
            c.send(body.msg);
        });
        return this.statusCode(200);
    }

    @httpPost("/speed")
    private speed(
        @requestBody() body: any
    ): interfaces.IHttpActionResult {
        const channels = this.neruko.getBot().channels as Collection<string, TextChannel>;
        const talkChannels =  channels.filter((c) => c.id === process.env.CHANNEL_ID);
        talkChannels.forEach(c => {
            c.send(body.msg);
        });
        return this.statusCode(200);
    }
}
