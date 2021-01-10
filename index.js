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
    
    /**
     * @type {Discord.GuildMember[]}
     */
    let players = [];

    //boucle pour trouver tous les membres
    for (let arg of args) {
        let member = serveur.members.cache.find((v, k, c) => {
            return v.nickname == arg;
        });

        if (member == undefined) {
            nbOfNull++;
        }else{
            players.push(member);
        }
    }

    msg.channel.send("Nombre de joueurs introuvables : " + nbOfNull);
    if (players.length >= 4) {
        //lancement des demandes de partie
        new game.Game(serveur, msg.member, players);
    }else{
        msg.channel.send("Il faut être min 5 pour jouer : il y a un imposteurs pour 5 villageois");
    }
});

command.addCommand("help", (msg, args, content) => {
    msg.author.send(new Discord.MessageEmbed()
        .setAuthor("Message d'aide")
        .setColor("00ff20")
        .setTimestamp()
        .addField("lg", "Commence une partie de *Un loup dans la Bergerie.*, vous devez mettre les noms des autres joueurs en arguments")
        .addField("start", "Permet de commencer la partie même si tout les joueurs n'ont pas accepté.")
    );
});