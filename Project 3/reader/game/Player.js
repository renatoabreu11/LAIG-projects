/**
 * Player
 * @constructor
 */

function Player(team, score, isBot, scene) {
    this.team = team;
    this.score = score; // Tempo total das jogadas, número de vitorias, ou algo do género
    this.isBot = isBot;

    this.currAppear = null;
    this.playerAppear = new CGFappearance(scene);
    this.playerAppear.setShininess(50);
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

Player.prototype.getAppear = function () {
    return this.playerAppear;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
}


Player.prototype.updateAppear = function (appear) {
    var equal = true;
    if(this.currAppear == null){
        this.currAppear = appear;
        equal = false;
    }
    else{
        if(this.currAppear != appear)
            equal = false;
    }
    if(!equal){
        this.currAppear = appear;
        var rgb = hexToRgb(appear);
        var r = rgb.r /  255 ;
        var g = rgb.g /  255 ;
        var b = rgb.b /  255 ;
        this.playerAppear.setAmbient(r, g, b, 0.2);
        this.playerAppear.setDiffuse(r, g, b, 0.2);
        this.playerAppear.setSpecular(r, g, b, 0.2);
    }
}

Player.prototype.getScore = function () {
    return this.score;
}

Player.prototype.getIsBot = function () {
    return this.isBot;
}

Player.prototype.setIsBot = function (value) {
    this.isBot = value;
}