const Discord = require("discord.js");
const Game = require("./game").Game;

//list des joueurs en attente de confirmation
const players = new Map();

/**
 * fonction pour demmander une confirmation
 * @param {Game} game 
 * @param {Discord.GuildMember} member
 */
function confirm(game, member) {
    
}

module.exports = {
    confirm
}