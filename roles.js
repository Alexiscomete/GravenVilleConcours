const Discord = require("discord.js");

/*
Ce system est prévu pour un nombre illimité de rôles !
Il me suffit de créer une nouvelle class et d'ajouter les conditions
dans game.js
*/

//permet de créer un vote
class Vote {
    /**
     * liste toutes les voies
     * @type {{player: string, number: Number}[]}
     */
    votes = []
    /**
     * 
     * @param {} who 
     * @param {*} forWho 
     */
    constructor(who, forWho) {

    }
    /**
     * permet d'ajouter une voie à un joueur
     * @param {Discord.TextChannel} channel 
     * @param {Discord.GuildMember} member
     */
    addVote(channel, member) {
        channel.send("Une nouvelle voie pour " + member.displayName + " !");
        /**
         * le joueur à qui on doit ajouter une voie
         * @type {{player: string, number: Number}}
         */
        let p;
        this.votes.forEach((v, i, a) => {
            if (v.player == member.id) {
                p = v;
            }
        });
        if (p) {
            p.number++;
        }else{
            this.votes.push({
                player: member.id,
                number: 1
            });
        }
    }
}

class Role {
    //le nom du rôle indiqué en MP eu joueur
    name = "";
    //la priorité du rôle pendant une journée (dans une liste triée)
    priority = 0;
    //la liste des joueurs ayant ce rôle
    players = [];
    //l'action fait à chaque tour et condition de fin de tour
    action() {}
    //le début de l'action : set des permissions pour parler
    actionBegin() {}
    //les conditions de victoire
    victory() {}
}

//pour les noms villageois : des règles en plus
class Special extends Role {
    /**
     * le salon privé
     * @type {Discord.GuildChannel}
     */
    channel;
    /**
     * pour sélectionner les joueurs
     * @param {Discord.GuildMember} players 
     * @param {Discord.Guild} guild
     */
    addPlayers(players, guild) {
        this.channel = guild.channels.add("");
        this.channel.setName(this.name);
        for (let i = 0; i < count; i++) {
            
        }
    }
    //le nb de joueurs qui doivent avoir ce rôle
    count = 0;
}

class Impostor extends Special{
    name = "impostor";
    priority = 6;
    
}

class Villager extends Role{
    name = "villager";
    priority = 0;
}

module.exports = {
    Role,
    Impostor,
    Villager,
    Special
}