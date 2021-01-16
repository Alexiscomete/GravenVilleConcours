const Discord = require("discord.js");
const { bot } = require(".");
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
     * @param {Discord.GuildMember[]} who qui peut voter
     * @param {Discord.GuildMember[]} forWho pour qui on peut voter
     */
    constructor(who, forWho) {
        this.who = who;
        this.forWho = forWho;
    }
    /**
     * permet d'ajouter une voie à un joueur
     * @param {Discord.TextChannel} channel le lieu du vote
     * @param {Discord.GuildMember} member qui vote
     * @param {Discord.GuildMember} who qui viens de voter
     */
    addVote(channel, member, who) {
        if (!this.forWho.includes(member)) {
            channel.send("Vous ne pouvez pas voter pour cette personne !");
            return;
        }
        if (!this.who.includes(who)) {
            who.send("Vous ne pouvez pas voter !!!!!");
            return;
        }
        this.who.splice(this.who.indexOf(who), 1); // permet d'éviter de voter 2 fois
        channel.send("Une nouvelle voie pour " + member.displayName + " !");
        /**
         * le joueur à qui on doit ajouter une voie
         * @type {{player: string, number: Number}}
         */
        let p;
        this.votes.forEach((v, i, a) => { //permet de trouver la joueur dans la liste si il existe
            if (v.player == member.id) {
                p = v;
            }
        });
        if (p) {
            p.number++;
        } else {
            this.votes.push({
                player: member.id,
                number: 1
            });
        }
        this.votes.sort((a, b) => { // permet de trier la liste dans l'ordre décroissant
            return b.number - a.number;
        });
        channel.send(bot.users.cache.get(this.votes[0].player).username + " est en tête de vote !");
        if (this.who.length == 0) {
            channel.send("Vote terminé");
            return bot.users.cache.get(this.votes[0].player);
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
    action(msg, args, content) { }
    //le début de l'action : set des permissions pour parler
    actionBegin() { }
    //les conditions de victoire
    victory() { }
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
            this.channel.updateOverwrite(this.game.guild.roles.everyone, { VIEW_CHANNEL: false });
            for (let i = 0; i < this.count; i++) {
                let j = getRandom(players.length);
                let p = players[j];
                players.splice(j, 1);
                this.players.push(p);
                //on évite qu'ils puissent evoyer ds msg quand il fait jour ou que ce n'est pas leur tour
                this.channel.updateOverwrite(p, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
                p.send("Vous êtes " + this.name);
            }
        });
    }
    //le nb de joueurs qui doivent avoir ce rôle
    count = 0;
}

class Impostor extends Special {
    name = "imposteur";
    priority = 6;
    actionBegin() {
        for (const p of this.players) {
            this.channel.updateOverwrite(p, { SEND_MESSAGES: true });
        }
        this.channel.send("Les imposteurs se réveillent ... qui voulez vous tuer ce soir ?");
        this.vote = new Vote(this.players, this.game.players);
    }
}

class Villager extends Role {
    name = "villageois";
    priority = 0;

    /**
     * @param {Discord.GuildMember[]} players 
     */
    addPlayers(players) {
        this.players.push(...players);
        this.game.guild.channels.create(this.name).then((ch) => {
            this.channel = ch;
            this.channel.updateOverwrite(this.game.guild.roles.everyone, { VIEW_CHANNEL: false });
            //pour éviter que tous le monde puisse parler dnas le salon des villageois, je met un role à tous les joueurs de la partie
            this.game.guild.roles.create().then((role) => {
                this.gameRole = role;
                role.setName("Lg");
                //la nuit, ils ne peuvent pas envoyer de msg.
                this.channel.updateOverwrite(role, { SEND_MESSAGES: false, VIEW_CHANNEL: true });
            });

        });

        //annonce aux villageois
        for (const p of this.players) {
            p.send("Malheuresement, vous êtes villageois");
        }
    }

    actionBegin() {
        this.channel.send("Le jour se lève ... mais qui sont les imposteurs ?");
        this.channel.updateOverwrite(this.gameRole, { SEND_MESSAGES: true});
        this.vote = new Vote(this.game.players, this.game.players);
    }

    
}

module.exports = {
    Role,
    Impostor,
    Villager,
    Special
}

