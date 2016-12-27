/**
 * Sequence
 * @constructor
 */

function Sequence() {
    this.gameMoves = [];
    this.undo = false;
    this.undoOnQueue = false;
    this.numberOfPlays = 0;
}

/**
 *
 * @type {Sequence}
 */
Sequence.prototype.constructor = Sequence;

Sequence.prototype.addMove = function (move) {
    this.gameMoves.push(move);
    this.numberOfPlays++;
}

Sequence.prototype.canUndo = function (player) {
    if(this.numberOfPlays == 0)
        return false;

    var lastMove = this.gameMoves[this.numberOfPlays - 1];
    var pieceTeam = lastMove.getPiece().getColour();

    if(pieceTeam != player)
        return false;

    return true;
}

Sequence.prototype.undoMove = function () {
    this.numberOfPlays--;
    return this.gameMoves.pop();
}

Sequence.prototype.getUndoOnQueue = function () {
    return this.undoOnQueue;
}

Sequence.prototype.setUndoOnQueue = function (value) {
    this.undoOnQueue = value;
}

Sequence.prototype.getUndo = function () {
    return this.undo;
}

Sequence.prototype.setUndo = function (value) {
    this.undo = value;
}

Sequence.prototype.getSequence = function () {
    return this.gameMoves;
}

Sequence.prototype.resetMoves = function () {
    this.gameMoves.splice(0, this.gameMoves.length);
    this.numberOfPlays = 0;
}
