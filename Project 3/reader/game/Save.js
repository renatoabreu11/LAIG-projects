/**
 * Save
 * @constructor
 */

function Save(gameSequence, winner, mode, diff, index) {
    this.name = "movie" + index;
    this.sequence = gameSequence;
    this.moveIndex = -1;
    this.winner = winner;
    this.mode = mode;
    this.difficulty = diff;
}

/**
 *
 * @type {Save}
 */
Save.prototype.constructor = Save;

Save.prototype.getName = function () {
    return this.name;
}

Save.prototype.getCurrentMove = function () {
    return this.sequence.getMove(this.moveIndex);
}

Save.prototype.getWinner = function () {
    return this.winner;
}

Save.prototype.getMoveSequence = function () {
    return this.sequence;
}

Save.prototype.setMoveIndex = function (value) {
    this.moveIndex = value;
}

Save.prototype.getMoveIndex = function () {
    return this.moveIndex;
}

Save.prototype.updateMoveIndex = function () {
    this.moveIndex++;
}