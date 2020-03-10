import { Client, TextChannel, Collection } from "discord.js";
import express = require("express");
import { Request, Response } from "express";
import bodyParser = require("body-parser");

async function init(): Promise<void> {
    const bot = new Client();
    bot.on("ready", () => {
        console.log(`Logged in as ${bot.user.tag}!`);
        console.log(`Output to: ${process.env.CHANNEL_ID}`);
    });
    bot.on("message", (msg) => {
        if (msg.content === "~neruko:cid") {
            msg.reply(`Your channel id is : \`${msg.channel.id}\``);
        }
    });
    // Make sure Discord bot is logged in before anything.
    await bot.login(process.env.DISCORD_TOKEN);

    // Starts webserver
    const app = express();
    app.use(bodyParser.json());
    app.get("/", (req: Request, res: Response) => {
        res.send("Hello Happy World :) - Neruko~~");
    });

    // Shift management
    app.post('/shift/announce', (req: Request, res: Response) => {
        const channels = bot.channels as Collection<string, TextChannel>;
        const talkChannels =  channels.filter((c) => c.id === req.body.cid);
        talkChannels.forEach(c => {
            c.send(req.body.msg);
        });
        res.sendStatus(200);
    });

    // Speed announcement
    app.post('/speed/announce', (req: Request, res: Response) => {
        const channels = bot.channels as Collection<string, TextChannel>;
        const talkChannels =  channels.filter((c) => c.id === process.env.CHANNEL_ID);
        talkChannels.forEach(c => {
            c.send(req.body.msg);
        });
        res.sendStatus(200);
    });
    app.listen(process.env.PORT, () => console.log("Started"));
}

init();
