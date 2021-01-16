const Discord = require("discord.js");
const bot = new Discord.Client();

bot.login(process.env.tokenG);

bot.on("ready", () => {
    console.log("ready");
    bot.user.setActivity("Participe à un concours, préfix $, owner du bot : Alexiscomete");

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
    
        //pour enlever le préfix de la liste
        args.splice(0,1);

        //boucle pour trouver tous les membres
        for (let arg of args) {
            let member = serveur.members.cache.find((v, k, c) => {
                //on regarde si l'argument correspond et on reffuse si il invite le bot ou lui même
                return "<@!" + v.id + ">" == arg && v.id != bot.id && v.id != msg.author.id && !players.includes(v);
            });
    
            if (member == undefined) {
                nbOfNull++;
            }else{
                players.push(member);
            }
        }
    
        if (nbOfNull > 0) msg.channel.send("Nombre de joueurs introuvables : " + nbOfNull + ", vous devez mentionner le joueur pour jouer avec lui");
        if (players.length <= 4) {
            //lancement des demandes de partie
            console.log(players.length);
            new game.Game(serveur, msg.member, players, msg.channel);
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
            .addField("ac", "Cette commande permet de faire son action")
        );
    });

});

