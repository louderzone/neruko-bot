import { Client, TextChannel, Collection } from "discord.js";
import express = require("express");
import { Request, Response } from "express";
import bodyParser = require("body-parser");

async function init(): Promise<void> {
    const bot = new Client();
    bot.on('ready', () => {
        console.log(`Logged in as ${bot.user.tag}!`);
    });
    // Make sure Discord bot is logged in before anything.
    await bot.login(process.env.DISCORD_TOKEN);

    // Starts webserver
    const app = express();
    app.use(bodyParser.json());
    app.get("/", (req: Request, res: Response) => {
        res.send("Hello Happy World :) - Neruko~~");
    });
    app.post('/shift/announce', (req: Request, res: Response) => {
        const channels = bot.channels as Collection<string, TextChannel>;
        const talkChannels =  channels.filter((c) => c.name === process.env.CHANNEL_NAME);
        console.log(talkChannels);
        talkChannels.forEach(c => {
            console.log(`Sent to ${c.name}: ${c.id}`)
            c.send(req.body.msg);
        });
        res.sendStatus(200);
    });
    app.listen(process.env.PORT, () => console.log("Started"));
}

init();
