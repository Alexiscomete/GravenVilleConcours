const Discord = require("discord.js");
const bot = new Discord.Client();

bot.login("Nzk3NDk5NTMyNDQ2OTI0ODMx.X_nXUQ.kl50mFF3RMo7SsiTzDchR7ZWJkM");

bot.on("ready", () => {
    console.log("ready");
    bot.user.setActivity("Participe à un concours");
});

module.exports = {
    bot
}

const command = require("./commands");