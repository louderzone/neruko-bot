import { Client, TextChannel, Collection } from "discord.js";
import express = require("express");
import { Request, Response } from "express";

const bot = new Client();
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});
bot.login(process.env.DISCORD_TOKEN);

// Starts webserver
const app = express();
app.post('/shift/announce', (req: Request, res: Response) => {
    const channels = bot.channels as Collection<string, TextChannel>;
    channels.find(`name`, `班表／シフト確定`).send(req.body);
    res.send(200);
});
app.listen("61000", () => console.log("Started"));
