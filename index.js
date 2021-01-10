const Discord = require("discord.js");
const bot = new Discord.Client();

bot.login(process.env.tokenG);

bot.on("ready", () => {
    console.log("ready");
    bot.user.setActivity("Participe à un concours, préfix $");
});

module.exports = {
    bot
}

const command = require("./commands");
const game = require("./game");
const confirm = require("./confirm");

/*
commande qui permet de commencer une partie
*/
command.addCommand("lg", (msg, args, content) => {
    if (msg.guild == undefined) {
        msg.channel.send("Vous devez être dans un serveur pour exécuter cette commande").then(message => {
            if(message.deletable)
            msg.delete({ timeout: 50000 });
            });
        return;
    }
    let serveur = msg.guild;
    let nbOfNull = 0;
    let thisGame = new game.Game();

    confirm.confirm(thisGame, msg.member);

    //boucle pour trouver tous les membres
    for (let arg of args) {
        let member = serveur.members.cache.find((v, k, c) => {
            return v.nickname == arg;
        });

        if (member == undefined) {
            nbOfNull++;
        }else{
            confirm.confirm(thisGame, member);
        }
    }

    msg.member.send("Nombre de joueurs introuvables : " + nbOfNull);
});

command.addCommand("help", (msg, args, content) => {
    msg.author.send(new Discord.MessageEmbed()
    .setAuthor("Message d'aide")
    .setColor("00ff20")
    .setTimestamp()
    .addField("lg", "Commence une partie de *Un loup dans la Bergerie.*, vous devez mettre les noms des autres joueurs en arguments")
    
    );
});