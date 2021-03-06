/**
 * Player
 * @constructor
 */

function Player(team, score, isBot, scene) {
    this.team = team;
    this.score = score;
    this.isBot = isBot;

    this.currAppear = null;
    this.appearAsRBG = null;
    if(this.team == "blue")
        this.views = ["player1View1", "player1View2", "player1View3", "lateralView"];
    else this.views = ["player2View1", "player2View2", "player2View3", "lateralView"];
    this.viewIndex = 0;
    this.playerAppear = new CGFappearance(scene);
    this.playerAppear.setShininess(50);
}

Player.prototype = Object.create(CGFobject.prototype);
Player.prototype.constructor = Player;

/**
 * Updates player pieces appear
 * @param appear
 */
Player.prototype.updateAppear = function (appear) {
    this.currAppear = appear;
    var rgb = hexToRgb(appear);
    var r = rgb.r /  255 ;
    var g = rgb.g /  255 ;
    var b = rgb.b /  255 ;
    this.appearAsRBG = [r, g, b];
    this.playerAppear.setAmbient(r, g, b, 0.2);
    this.playerAppear.setDiffuse(r, g, b, 0.2);
    this.playerAppear.setSpecular(r, g, b, 0.2);
    return true;
}

/**
 * Get Player views
 * @returns {Array|string[]}
 */
Player.prototype.getViews = function () {
    return this.views;
}

/**
 * Get current view
 * @returns {*|string}
 */
Player.prototype.getCurrentView = function () {
    return this.views[this.viewIndex];
}

/**
 * Updates view index
 */
Player.prototype.updateView = function () {
    this.viewIndex++;
    if(this.viewIndex == this.views.length)
        this.viewIndex = 0;
}

/**
 * reverses last view update
 */
Player.prototype.reverseView = function () {
    this.viewIndex--;
    if(this.viewIndex == -1)
        this.viewIndex = this.views.length-1;
}

/**
 * Returns current view index
 */
Player.prototype.getViewIndex = function () {
    return this.viewIndex;
}

/**
 * Sets current view index
 */
Player.prototype.setViewIndex = function (value) {
    this.viewIndex = value;
}


/**
 * Returns player team -> blue or red
 * @returns {*}
 */
Player.prototype.getTeam = function () {
    return this.team;
}

/**
 * Returns player appear as rgb
 * @returns {Array|[*,*,*]|null}
 */
Player.prototype.getAppearAsRGB = function () {
    return this.appearAsRBG;
}

/**
 * Returns player appear
 * @returns {CGFappearance}
 */
Player.prototype.getAppear = function () {
    return this.playerAppear;
}

/**
 * Returns player number of wins
 * @returns {*}
 */
Player.prototype.getScore = function () {
    return this.score;
}

/**
 * Returns isBot value that defines if the player is a bot or not
 * @returns {*}
 */
Player.prototype.getIsBot = function () {
    return this.isBot;
}

/**
 * Sets isBot value
 * @param value
 */
Player.prototype.setIsBot = function (value) {
    this.isBot = value;
}

/**
* Auxiliar function that converts an hexadecimal color value to a rgb one
* @param hex
* @returns {*}
*/
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
}