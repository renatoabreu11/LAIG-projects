/**
 * Player
 * @constructor
 */

function Player(team, score, isBot, scene) {
    this.team = team;
    this.score = score; // Tempo total das jogadas, número de vitorias, ou algo do género
    this.isBot = isBot;

    var currAppear = null;
    this.playerAppear = new CGFappearance(scene);
    this.playerAppear.setAmbient(0.3, 0.3, 0.3, 1);
    this.playerAppear.setDiffuse(0.3, 0.3, 0.3, 1);
    this.playerAppear.setSpecular(0.6, 0.6, 0.6, 1);
    this.playerAppear.setShininess(10);
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

Player.prototype.updateAppear = function (appear) {
    var equal = true;
    if(this.currAppear == null){7
        this.currAppear = appear;
        equal = false;
    }
    else{
        for(var i = 0; i < this.currAppear.length; i++){
            if(this.currAppear[i] != appear[i]){
                equal = false;
                break;
            }
        }
    }
    if(!equal){
        var r = appear[0] /  255 ;
        var g = appear[1] /  255 ;
        var b = appear[2] /  255 ;
        var a = appear[3] /  255 ;
        this.playerAppear.setAmbient(r, g, b, a);
        this.playerAppear.setDiffuse(r, g, b, a);
        this.playerAppear.setSpecular(r, g, b, a);
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