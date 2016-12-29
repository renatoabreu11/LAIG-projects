/**
 * Sequence
 * @constructor
 */

function Sequence() {
    this.gameMoves = [];
    this.undo = false;
    this.undoOnQueue = false;
    this.undoPlayerMoves = false;
    this.numberOfPlays = 0;
}

Sequence.prototype.constructor = Sequence;

/**
 * Adds a new move to the game sequence
 * @param move
 */
Sequence.prototype.addMove = function (move) {
    this.gameMoves.push(move);
    this.numberOfPlays++;
}

/**
 * Checks if the current player can undo their last move
 * @param player
 * @returns {boolean}
 */
Sequence.prototype.canUndo = function (player) {
    if(this.numberOfPlays == 0)
        return false;

    var lastMove = this.gameMoves[this.numberOfPlays - 1];
    var pieceTeam = lastMove.getPiece().getColour();

    if(pieceTeam != player)
        return false;

    return true;
}

/**
 * Removes the last move from the sequence
 * @returns {*}
 */
Sequence.prototype.undoMove = function () {
    this.numberOfPlays--;
    return this.gameMoves.pop();
}

/**
 * Resets all moves in the sequence
 */
Sequence.prototype.resetMoves = function () {
    this.gameMoves.splice(0, this.gameMoves.length);
    this.numberOfPlays = 0;
}

/****************** Getters and Setters **********************/

/**
 * Returns the number of moves in the sequence
 * @returns {number}
 */
Sequence.prototype.getNumberOfPlays = function () {
    return this.numberOfPlays;
}

/**
 * Returns undoOnQueue value. This value is used to check if there is another undo to do
 * @returns {*|boolean}
 */
Sequence.prototype.getUndoOnQueue = function () {
    return this.undoOnQueue;
}

/**
 * Sets undoOnQueue
 * @param value
 */
Sequence.prototype.setUndoOnQueue = function (value) {
    this.undoOnQueue = value;
}

/**
 * Returns undoPlayerMoves value. This value is used to check if there is needed to undo all player moves
 * @returns {*|boolean}
 */
Sequence.prototype.getUndoPlayerMoves = function () {
    return this.undoPlayerMoves;
}

/**
 * Sets undoPlayerMoves
 * @param value
 */
Sequence.prototype.setUndoPlayerMoves = function (value) {
    this.undoPlayerMoves = value;
}

/**
 * returns Undo value
 * @returns {boolean|*}
 */
Sequence.prototype.getUndo = function () {
    return this.undo;
}

/**
 * Sets undo value
 * @param value
 */
Sequence.prototype.setUndo = function (value) {
    this.undo = value;
}

/**
 * Returns all moves in the sequence
 * @returns {Array}
 */
Sequence.prototype.getSequence = function () {
    return this.gameMoves;
}

/**
 * Returns the respective move in the array accordingly to the index given
 * @param index
 * @returns {*}
 */
Sequence.prototype.getMove = function (index) {
    if(index < 0 || index >= this.numberOfPlays)
        return null;
    else return this.gameMoves[index];
}

