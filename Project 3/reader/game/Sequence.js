/**
 * Sequence
 * @constructor
 */

function Sequence() {
    this.gameMoves = [];
}

/**
 *
 * @type {Sequence}
 */
Sequence.prototype.constructor = Sequence;

Sequence.prototype.addMove = function (move) {
    this.gameMoves.push(move);
}

Sequence.prototype.undoMove = function () {
    this.gameMoves.pop();
}

Sequence.prototype.getSequence = function () {
    return this.gameMoves;
}

Sequence.prototype.resetMoves = function () {
    this.gameMoves.splice(0, this.gameMoves.length);
}
