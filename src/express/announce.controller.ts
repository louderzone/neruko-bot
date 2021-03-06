import { TextChannel } from "discord.js";
import { inject } from "inversify";
import {
    BaseHttpController,
    controller,
    httpGet,
    httpPost,
    interfaces,
    requestBody
} from "inversify-express-utils";
import { SERVICE } from "../constants/services";
import { MongoDb } from "../database/mongodb.service";
import { Neruko, NERUKO_NAME } from "../discord/bot.service";
import { ShiftForm } from "./announce/shift.form";
import { SpeedForm } from "./announce/speed.form";

/**
 * Represents the announcement purpose for calling
 * Taiwanese member to prepare on board 15 minutes
 * before their subscribed session
 */
export const ANNOUNCE_PURPOSE_TW_ONBOARD = "tw-15";

/**
 * Represents the announcement purpose for calling
 * Japanese member to prepare on board 15 minutes
 * before their subscribed session
 */
export const ANNOUNCE_PURPOSE_JP_ONBOARD = "jp-15";

/**
 * Represents the announcement purpose for calling help
 * if at least one of the members has disappeared from the shift
 */
export const ANNOUNCE_PURPOSE_MISSING_MEMBER = "member-missing";

/**
 * An http endpoint handling announcement related requests
 */
@controller("/announce")
export class AnnounceController extends BaseHttpController {
    constructor(
        @inject(SERVICE.Bot) private neruko: Neruko,
        @inject(SERVICE.MongoDb) private db: MongoDb
    ) {
        super();
    }

    /**
     * Web hook receiving announcement data regarding to shift management
     *
     * @param body
     */
    @httpPost("/shift")
    private async shift(
        @requestBody() body: ShiftForm
    ): Promise<interfaces.IHttpActionResult> {
        const { cid, msg: content, purpose } = body;
        if (content.trim().length === 0) { return this.statusCode(204); } // Do not send empty content

        const targetChannel =  await this.neruko
            .getBot()
            .channels.fetch(cid) as TextChannel;
        if (targetChannel === undefined) { return this.statusCode(204); } // Channel not found

        const msg = await targetChannel.send(content);
        if (purpose !== ANNOUNCE_PURPOSE_TW_ONBOARD) { return this.ok(); }

        // Updates the last announce statistics after announcement
        // On board only Taiwanese members
        await this.db.getStatuses()
            .findOneAndUpdate({
                name: NERUKO_NAME,
            }, {
                $set: {
                    lastAnnounce: {
                        id: msg.id,
                        responded: 0,
                        declined: 0,
                        purpose: ANNOUNCE_PURPOSE_TW_ONBOARD
                    }
                }
            });

        await msg.react("👌🏻");
        await msg.react("❌");
        this.neruko.subscribeToMessage(msg, 300_000);
        return this.ok();
    }

    /**
     * Endpoint retrieving the last announcement statistics
     */
    @httpGet("/stat")
    private async stat(): Promise<interfaces.IHttpActionResult> {
        const status = await this.db.getStatuses()
            .findOne({
                name: NERUKO_NAME
            });
        return this.json(status.lastAnnounce);
    }

    /**
     * Web hook receiving announcement data regarding to speed alert
     *
     * @param body
     */
    @httpPost("/speed")
    private async speed(
        @requestBody() body: SpeedForm
    ): Promise<interfaces.IHttpActionResult> {
        const speedChannel =  await this.neruko
            .getBot()
            .channels.fetch(process.env.CHANNEL_ID) as TextChannel;
        speedChannel.send(body.msg);
        return this.statusCode(200);
    }
}
