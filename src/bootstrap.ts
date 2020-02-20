import { Client, TextChannel, Collection } from "discord.js";
import express = require("express");
import { Request, Response } from "express";
import bodyParser = require("body-parser");

const bot = new Client();
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});
bot.login(process.env.DISCORD_TOKEN);

// Starts webserver
const app = express();
app.use(bodyParser.json());
app.get("/", (req: Request, res: Response) => {
    res.send("Hello Happy World :) - Neruko~~");
});
app.post('/shift/announce', (req: Request, res: Response) => {
    const channels = bot.channels as Collection<string, TextChannel>;
    channels.find(`name`, process.env.CHANNEL_NAME).send(req.body.msg);
    res.send(200);
});
app.listen(process.env.PORT, () => console.log("Started"));
