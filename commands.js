const Discord = require('discord.js');
const index = require("./index");

/**
 * Liste des commandes
 * @type {Map<string, (message: Discord.Message, args: string[], content: string) => void>}
 */
const commandes = new Map();

/**
 * Ajouter une commande
 * @param {(message: Discord.Message, args: string[], content: string) => void} commande 
 * @param {string} name
 */
function addCommande(name, commande) {
    commandes.set(name, commande);
}

/*
Regarde les msg
 */
index.bot.on("message", (msg) => {
    let content = msg.content.toLowerCase();
    if (content.startsWith("$")) {
        //séparation des arguments et supression du préfix
        let commande = content.slice(1);
        let args = commande1.split(" ");
        commande = args[0];
        let commandFunction = commandes.get(commande);
        if (commandFunction != undefined) {
            //supression de la commande
            if (message.deletable) message.delete();
            //exécution
            commandFunction(message, args, content);
        } else {
            // message d'erreur
            msg.channel.send("Cette commande n'existe pas ...\nLa commande indiquée est : " + commande + " \nPS : les abréviations ne sont pas acceptées").then(message => {
                if(message.deletable)
                msg.delete({ timeout: 50000 });
                });
        }
    }
});

module.exports = {
    addCommande,
}