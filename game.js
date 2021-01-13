const Discord = require("discord.js");
const index = require("./index");

//la liste des parties en cours
const games = [];
//une map des guilds avec leur partie
const guilds = new Map();
/**
 * la map des msg avec la partie en attente
 * @type {Map<string, Game>}
 */
const msgWAllGame = new Map();

class Role {
    name = "";
    /**
     * La liste des joueurs ayant ce rôle dans la partie
     * @type {Discord.GuildMember[]}
     */
    players = [];
    count = 0;
}

class Impostor extends Role{
    name = "impostor"
}

class Villager extends Role{
    name = "villager"
}

class Game {
    /**
     * 
     * @param {Discord.Guild} guild 
     * @param {Discord.GuildMember} owner 
     * @param {Discord.GuildMember[]} players 
     */
    constructor(guild, owner, players) {
        //le statut peut être jour, nuit ou en attente (début d'une partie)
        this.status = "waiting";
        this.statusRole = "";
        /**
         * la liste des rôles dans la partie
         * @type {Role[]}
         */
        this.roles = [];
        /**
         * la liste des joueurs en attente
         * @type {Discord.GuildMember[]}
         */
        this.playersWaiting = players;
        //la liste des joueurs
        this.players = [];
        players.push(owner);
        //la guild de la partie
        this.guild = guild;
        //owner de la partie et donc administrateur de cette partie, un admin du serveur peut aussi utiliser les commandes admins
        this.owner = owner;
        //la liste des msg où il y a un joueur en attente
        /**
         * @type {string[]}
         */
        this.msgW = [];
        
        //system prévu pour un ajout futur de rôles : la list des rôles contient tout les rôles utilisés et l'instance du rôle est fait pour 1 partie
        this.im;
        this.vi = new Villager();
        this.roles.push(this.vi);

        games.push(this);
        guilds.set(guild, this);

        for (let p of this.playersWaiting) {
            //message envoyé
            p.send(`Voulez-vous participer à la partie de ${this.owner.displayName} sur le serveur ${this.guild.name} ?`).then((msg) => {
                //réactions
                msg.react('✅');
                msg.react('❌');
                this.msgW.push(msg.id);
                msgWAllGame.set(msg.id, this);
            });
            
            
        }
    }
    addPlayer(player) {
        this.players.push(player);
        if (this.players.length % 5 == 0) {
            if (this.im == undefined) {
                //système d'ajout de rôle, il n'est pas opti mais c'est pour le cas où j'ajoute des rôles qui ne sont pas dans toutes les parties
                this.im = new Impostor();
                this.roles.push(im);
                this.im.count++;
            }else {
                //ajoute 1 au nombre d'imprteurs dans la partie
                this.im.count++;
            }
        }else {
            //ajoute 1 au nb de villageois
            this.vi.count++;
        }
        if (this.playersWaiting.length == 0) {
            this.start();
        }
    }
    start() {
        if (this.players.length >= 5) {
            this.status = "night";
            this.statusRole = "im";
        }else{
            this.owner.send("Il faut être 5 ou plus pour lancer une partie, votre partie vas être supprimée pour que vous puissiez en recommencer une");
            guilds.delete(this.guild);
            games.splice(games.indexOf(this), 1);
            for (let msg of this.msgW) {
                msgWAllGame.delete(msg.id);
            }
            this.msgW = [];
        }
    }
    action() {

    }
}

//Vérifie les réactions, si le message est un message de demande alors il supprime toutes les instances d'objets en trop
index.bot.on("messageReactionAdd", (react, user) => {
    let game = msgWAllGame.get(react.message.id);
    if (game != undefined) {
        if (react.emoji.name == '✅') {
            game.msgW.splice(game.msgW.indexOf(react.message), 1);
            game.playersWaitings.splice(game.playersWaiting.indexOf(game.guild.members.cache.get(user.id)), 1);
            msgWAllGame.delete(react.message.id);
            game.owner.send(`${user.username} a accepté(e) de jouer avec vous :)`);
            game.addPlayer(game.guild.members.cache.get(user.id));
        }else if (react.emoji.name == '❌') {
            game.msgW.splice(game.msgW.indexOf(react.message), 1);
            msgWAllGame.delete(react.message.id);
            game.playersWaitings.plice(game.playersWaiting.indexOf(game.guild.members.cache.get(user.id)), 1);
            game.owner.send(`${user.username} n'a pas voulu jouer avec vous :(`);
        }else {
            user.send("Ceci n'est pas une réponse !!!!!");
        }
    }
});

module.exports = {
    Game
}