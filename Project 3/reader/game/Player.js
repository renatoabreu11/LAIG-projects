/**
 * Player
 * @constructor
 */

function Player(team, score, isBot) {
    this.team = team;
    this.score = score; // Tempo total das jogadas, número de vitorias, ou algo do género
    this.isBot = isBot;
}

/**
 *
 * @type {Player}
 */
Player.prototype = Object.create(CGFobject.prototype);
Player.prototype.constructor = Player;

Player.prototype.getTeam = function () {
    return this.team;
}

Player.prototype.getScore = function () {
    return this.score;
}

Player.prototype.getIsBot = function () {
    return this.isBot;
}