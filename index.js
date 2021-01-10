const Discord = require("discord.js");
const bot = new Discord.Client();

bot.login(process.env.tokenG);

bot.on("ready", () => {
    console.log("ready");
    bot.user.setActivity("Participe à un concours");
});

module.exports = {
    bot
}

const command = require("./commands");
