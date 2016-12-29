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

Save.prototype.constructor = Save;

/**
 * Returns the name given to the saved game
 * @returns {string|*}
 */
Save.prototype.getName = function () {
    return this.name;
}

/**
 * Sets the moveIndex value. This value is used in the game movie
 * @param value
 */
Save.prototype.setMoveIndex = function (value) {
    this.moveIndex = value;
}

/**
 * Returns the move current index
 * @returns {*|number}
 */
Save.prototype.getMoveIndex = function () {
    return this.moveIndex;
}

/**
 * Updates the move index
 */
Save.prototype.updateMoveIndex = function () {
    this.moveIndex++;
}

/**
 * Returns the current move played in the movie
 * @returns {*}
 */
Save.prototype.getCurrentMove = function () {
    return this.sequence.getMove(this.moveIndex);
}

/**
 * Returns the winner of the game
 * @returns {*}
 */
Save.prototype.getWinner = function () {
    return this.winner;
}

/**
 * Returns the sequence of moves
 * @returns {*}
 */
Save.prototype.getMoveSequence = function () {
    return this.sequence;
}