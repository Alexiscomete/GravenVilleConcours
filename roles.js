const Discord = require("discord.js");
const game = require("./game");

/*
Ce system est prévu pour un nombre illimité de rôles !
Il me suffit de créer une nouvelle class et d'ajouter les conditions
dans game.js
*/

function getRandom(max) {
    return Math.floor(Math.random() * max);
}

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
    /**
     * la liste des joueurs ayant ce rôle
     * @type {Discord.GuildMember[]}
     */
    players = [];
    //l'action fait à chaque tour et condition de fin de tour
    action() {}
    //le début de l'action : set des permissions pour parler
    actionBegin() {}
    //les conditions de victoire
    victory() {}
    /**
     * le salon privé
     * @type {Discord.TextChannel}
     */
    channel;
    /**
     * la partie en cour, pour pouvoir utiliser certaines choses plus facilement
     * @type {game.Game}
     */
    game;

    constructor(game) {
        this.game = game;
    }
}

//pour les noms villageois : des règles en plus
class Special extends Role {
    /**
     * pour sélectionner les joueurs
     * @param {Discord.GuildMember[]} players 
     * @param {Discord.Guild} guild
     */
    addPlayers(players) {
        this.game.guild.channels.create(this.name).then((ch) => {
            this.channel = ch;
            this.channel.updateOverwrite(this.game.guild.roles.everyone, {VIEW_CHANNEL: false});
            for (let i = 0; i < this.count; i++) {
                let j = getRandom(players.length);
                let p = players[j];
                players.splice(j, 1);
                this.players.push(p);
                //on évite qu'ils puissent evoyer ds msg quand il fait jour ou que ce n'est pas leur tour
                this.channel.updateOverwrite(p, {VIEW_CHANNEL: true, SEND_MESSAGES: false});
                p.send("Vous êtes " + this.name);
            }
        });
    }
    //le nb de joueurs qui doivent avoir ce rôle
    count = 0;
}

class Impostor extends Special{
    name = "imposteur";
    priority = 6;
    actionBegin() {
        for (const p of this.players) {
            this.channel.updateOverwrite(p, {SEND_MESSAGES: true});
        }
        this.channel.send("Les imposteurs se réveillent ... qui voulez vous tuer ce soir ?");
    }
}

class Villager extends Role{
    name = "villageois";
    priority = 0;

    /**
     * @param {Discord.GuildMember[]} players 
     */
    addPlayers(players) {
        this.players.push(...players);
        this.game.guild.channels.create(this.name).then((ch) => {
            this.channel = ch;
            this.channel.updateOverwrite(this.game.guild.roles.everyone, {VIEW_CHANNEL: false});
            //pour éviter que tous le monde puisse parler dnas le salon des villageois, je met un role à tous les joueurs de la partie
            this.game.guild.roles.create().then((role) => {
                this.gameRole = role;
                role.setName("Lg");
                //la nuit, ils ne peuvent pas envoyer de msg.
                this.channel.updateOverwrite(role, {SEND_MESSAGES: false, VIEW_CHANNEL: true});
            });
            
        });

        //annonce aux villageois
        for (const p of this.players) {
            p.send("Malheuresement, vous êtes villageois");
        }
    }
}

module.exports = {
    Role,
    Impostor,
    Villager,
    Special
}

