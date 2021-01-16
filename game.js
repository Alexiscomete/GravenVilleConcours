const Discord = require("discord.js");
const index = require("./index");
const roles = require('./roles');
const command = require('./commands');

//la liste des parties en cours
const games = [];
/**
 * une map des guilds avec leur partie
 * @type {Map<string, Game>}
 */
const guilds = new Map();
/**
 * la map des msg avec la partie en attente
 * @type {Map<string, Game>}
 */
const msgW = new Map();

class Game {
    /**
     * 
     * @param {Discord.Guild} guild 
     * @param {Discord.GuildMember} owner 
     * @param {Discord.GuildMember[]} players 
     * @param {Discord.TextChannel} channel
     */
    constructor(guild, owner, players, channel) {
        //l'index du prochain rôle, -1 pour les villageois et -2 pour en attente de joueurs
        this.status = -2;
        /**
         * la liste des rôles non villageois dans la partie
         * @type {roles.Special[]}
         */
        this.roles = [];
        /**
         * la liste des joueurs en attente
         * @type {Discord.GuildMember[]}
         */
        this.playersWaiting = players;
        //
        /**
         * la liste des joueurs
         * @type {Discord.GuildMember[]}
         */
        this.players = [];
        this.players.push(owner);
        //la guild de la partie
        this.guild = guild;
        //owner de la partie et donc administrateur de celle-ci, un admin du serveur peut aussi utiliser les commandes admins
        this.owner = owner;
        this.channel = channel;
        //les villageois est le seul rôle qui n'est pas ds la liste car il ne foncionne pas comme les autres
        this.vi = new roles.Villager(this);
        //j'ajoute cette instance dès maintenant car il y a forcément un imposteur ds la partie
        this.roles.push(new roles.Impostor(this));

        games.push(this);
        guilds.set(guild.id, this);

        for (let p of this.playersWaiting) {
            console.log(p.displayName);
            //message envoyé
            p.send(`Voulez-vous participer à la partie de ${this.owner.displayName} sur le serveur ${this.guild.name} ?`).then((msg) => {
                //réactions
                msg.react('✅');
                msg.react('❌');
                msgW.set(msg.id, this);
            });


        }
    }
    /**
     * Est appelé quand un joueur valide l'invitation
     * @param {Discord.GuildMember} player 
     */
    addPlayer(player) {
        this.players.push(player);
        if (this.playersWaiting.length == 0) {
            this.start();
        }
    }
    start() {
        if (this.players.length <= 5) {
            //système pour supprimer tout les msg itutiles de la map
            msgW.forEach((v, k, m) => {
                if (v == this) {
                    msgW.delete(k);
                }
            });
            this.channel.send("La partie de ***Un loup dans la Bergerie.*** va commencer, la partie commence en mode nuit. SVP les admins ne trichez pas.");
            this.status = 0;
            //détermine le nb de lg
            this.roles[0].count = Math.round(this.players.length / 5);
            //pour le cas futur où il y aurait d'autres rôles
            //je duplique la liste pour la passer par valeur : chaque rôle sélectionne les joueurs qu'il veut puis le passe au suivant
            console.log("ps : " + this.players);
            let ps = [];
            ps.push(...this.players);
            for (const r of this.roles) {
                //je duplique la liste pour la passer par valeur
                r.addPlayers(ps);
            }
            this.vi.addPlayers(ps);
            ps = []; //on évite de gacher de la ram
            //on tri la liste de rôles spéciaux (pour le moment il y a seulement les lg mais je préfère faire comme si il y en avait une vingtaine)
            this.roles.sort((a, b) => {
                return a.priority - b.priority;
            });
            //on commence l'action : set ds permissions et annonce dans le salon
            this.roles[0].actionBegin();
        } else {
            this.owner.send("Il faut être 5 ou plus pour lancer une partie, votre partie vas être supprimée pour que vous puissiez en recommencer une");
            guilds.delete(this.guild.id);
            games.splice(games.indexOf(this), 1);
            msgW.forEach((v, k, m) => {
                if (v == this) {
                    msgW.delete(k);
                }
            });
        }
    }
    /**
     * 
     * @param {Discord.Message} msg 
     * @param {string[]} args 
     * @param {string} content 
     */
    action(msg, args, content) {
        if (this.status == -2) {
            msg.member.send("La partie n'a pas encore commencé ! Attendez au moins de connaitre votre rôle pour jouer !");
        } else if (this.status == -1) { // le tour des villageois
            if (this.vi.action(msg, args, content)) {
                this.next();
            }
        } else if (this.roles[this.status].action(msg, args, content)) { //je demande au rôle de jouer son action pour ce message, si return true alors c'est qu'il a finit son tour et que je peut passer à la suite
            this.next();
        }
    }

    next() {
        let victory = false // si quelqu'un a gagné
        for (let it = 0; it < this.roles.length && !victory; it++) { //on regarde si un role a gagné
            const r = this.roles[it];
            if (r.victory()) {
                this.vi.channel.send("Les/La personne(s) avec le role " + r.name + " a/ont gagné(s) !");
                victory = true;
            }
        }
        if (victory) {
            this.victory;
        } else {
            if (this.vi.victory()) {
                this.victory();
                return;
            }

            this.status++; //permet de passer au rôle suivant

            if (this.status == this.roles.length) {
                this.status = -1;
                this.vi.actionBegin();
                return;
            }

            this.roles[this.status].actionBegin();
        }

    }

    victory() { // permet de supprimer tous les salons spéciaux ! Je garde celui des villageois
        for (const r of this.roles) {
            r.channel.delete("Fin du jeu");
        }
    }
}

//Vérifie les réactions, si le message est un message de demande alors il supprime toutes les instances d'objets en trop
index.bot.on("messageReactionAdd", (react, user) => {
    if (user.bot) return;
    let game = msgW.get(react.message.id);
    if (game != undefined) {
        if (react.emoji.name == '✅') {
            game.playersWaiting.splice(game.playersWaiting.indexOf(game.guild.members.cache.get(user.id)), 1);
            msgW.delete(react.message.id);
            game.owner.send(`${user.username} a accepté(e) de jouer avec vous :)`);
            game.addPlayer(game.guild.members.cache.get(user.id));
        } else if (react.emoji.name == '❌') {
            msgW.delete(react.message.id);
            game.playersWaiting.splice(game.playersWaiting.indexOf(game.guild.members.cache.get(user.id)), 1);
            game.owner.send(`${user.username} n'a pas voulu jouer avec vous :(`);
        } else {
            user.send("Ceci n'est pas une réponse !!!!!");
        }
    }
});

module.exports = {
    Game
}

command.addCommand("start", (msg, args, content) => {
    if (msg.guild && guilds.has(msg.guild.id)) {
        const game = guilds.get(msg.guild.id);
        if (game.playersWaiting.length == 0) {
            msg.reply("... cette partie a déjà démmarée");
            return;
        }
        if (game.owner != msg.member && !msg.member.hasPermission('ADMINISTRATOR')) {
            msg.reply("... vous n'êtes pas l'administrateur de cette partie");
            return;
        }
        game.start();
    } else {
        msg.reply("aucune partie n'est en attente sur ce serveur");
    }
});

command.addCommand("ac", (msg, args, content) => {
    if (!msg.guild) {
        msg.author.send("Acune partie en MP !!");
        return;
    }
    const gameAction = guilds.get(msg.guild.id);
    if (gameAction) {
        gameAction.action();
    } else {
        msg.member.send("Acune partie sur ce serveur !!");
    }
});