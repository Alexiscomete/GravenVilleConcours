const Discord = require('discord.js');
const index = require("./index");

/**
 * Liste des commandes
 * @type {Map<string, (message: Discord.Message, args: string[], content: string) => void>}
 */
const commands = new Map();

/**
 * Ajouter une commande
 * @param {(message: Discord.Message, args: string[], content: string) => void} commande 
 * @param {string} name
 */
function addCommand(name, commande) {
    commands.set(name, commande);
}

/*
Regarde les msg
 */
index.bot.on("message", (msg) => {
    let content = msg.content.toLowerCase();
    if (content.startsWith("$")) {
        //séparation des arguments et supression du préfix
        let commande = content.slice(1);
        let args = commande.split(" ");
        commande = args[0];
        let commandFunction = commands.get(commande);
        if (commandFunction != undefined) {
            //supression de la commande
            if (msg.deletable) msg.delete();
            //exécution
            commandFunction(msg, args, content);
        } else {
            // message d'erreur
            msg.channel.send("Cette commande n'existe pas ...\nLa commande indiquée est : " + commande + " \nPS : les abréviations ne sont pas acceptées").then(message => {
                if (message.deletable)
                    message.delete({ timeout: 50000 });
            });
        }
    }
});

module.exports = {
    addCommand,
}