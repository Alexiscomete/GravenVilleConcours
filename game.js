const Discord = require("discord.js");
const index = require("./index");

//la liste des parties en cours
const games = [];
//une map des gilds avec leur partie
const guilds = new Map();

class Role {
    name = "";
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
        /**
         * la liste des rôles dans la partie
         * @type {Role[]}
         */
        this.roles = [];
        //la liste des joueurs en attente
        this.playersWaiting = players;
        //la liste des joueurs
        this.players = [];
        players.push(owner);
        //la guild de la partie
        this.guild = guild;
        //owner de la partie et donc administrateur de cette partie, un admin du serveur peut aussi utiliser les commandes admins
        this.owner = owner;
        
        games.push(this);
        guilds.set(guild, this);
    }
    addPlayer(player) {
        
    }
    start() {
        if (this.players.length >= 5) {
            status = "night";
        }else{
            this.owner.send("Il faut être 5 ou plus pour lancer une partie, votre parie vas être supprimé pour que vous puissiez en recommencer une");
        }
    }
}

module.exports = {
    Game
}