/**
 * Player
 * @constructor
 */

function Player(team, score) {
    this.team = team;
    this.score = score; // Tempo total das jogadas, número de vitorias, ou algo do género
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