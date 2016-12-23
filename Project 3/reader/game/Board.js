/**
 * Board
 * @constructor
 */

function Board(board_encoded) {
    this.board = [];

    this.plBoardParser(board_encoded);
    this.length = this.board.length;
}

/**
 *
 * @type {Board}
 */
Board.prototype.constructor = Board;

/**
 *
 * @param board_encoded
 */
Board.prototype.plBoardParser = function (board_encoded) {
    var startIndex=2;
    while(board_encoded.length>1) {
        finalIndex=board_encoded.indexOf("]");
        var lineStr = board_encoded.substring(startIndex,finalIndex);
        var lineArray = lineStr.split(",");
        this.board .push(lineArray);
        board_encoded = board_encoded.substring(finalIndex+1);
    }
};

/**
 *
 * @returns {Number|*}
 */
Board.prototype.getBoardLength = function () {
    return this.length;
}

/**
 *
 * @param Row
 * @param Col
 * @returns {*}
 */
Board.prototype.getElementAt = function (Row, Col) {
    if(!this.validPosition(Row, Col))
        return "Invalid Position";
    return this.board[Row][Col];
}

/**
 *
 * @param Row
 * @param Col
 * @returns {boolean}
 */
Board.prototype.validPosition = function (Row, Col) {
    if(Row < 0 || Col <  0 || Col >= this.length || Row >= this.length)
        return false;
    return true;
}

/**
 * 
 * @returns {void|XML}
 */
Board.prototype.toPrologStruct = function () {
    var string = JSON.stringify(this.board);
    var boardPL = string.replace(/['"]+/g, '');
    return boardPL;
}

