/**
 * Board
 * @constructor
 */

function Board(scene, encoded_board) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.board = [];

    this.plBoardParser(encoded_board);
    this.length = this.board.length;

    this.nodesAppearance = new CGFappearance(this.scene);
    this.nodesAppearance.loadTexture('../res/nodesboard.png');
    this.nodesBoard = new Plane(this.scene, 10, 10, 31, 31);
}

Board.prototype = Object.create(CGFobject.prototype);
Board.prototype.constructor = Board;

/**
 * Parse pl board to js
 * @param board_encoded
 */
Board.prototype.plBoardParser = function (board_encoded) {
    var startIndex=2;
    this.board=[];
    while(board_encoded.length>1) {
        finalIndex=board_encoded.indexOf("]");
        var lineStr = board_encoded.substring(startIndex,finalIndex);
        var lineArray = lineStr.split(",");
        this.board.push(lineArray);
        board_encoded = board_encoded.substring(finalIndex+1);
    }
};

/**
 * Puts a js board in a pl struct
 * @returns {void|XML}
 */
Board.prototype.toPrologStruct = function () {
    var string = JSON.stringify(this.board);
    var boardPL = string.replace(/['"]+/g, '');
    return boardPL;
}

/**
 * Displays board
 */
Board.prototype.display = function () {
    this.scene.pushMatrix();
    this.nodesAppearance.apply();
    this.scene.scale(1.03, 1.03, 1.03);
    this.scene.rotate(-90*Math.PI/180, 0, 1, 0);
    this.scene.rotate(-90*Math.PI/180, 1, 0, 0);
    this.nodesBoard.display();
    this.scene.popMatrix();
}

/**
 * Check if the given coordinates are valid
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
 * Updates board positions
 * @param srcRow
 * @param srcCol
 * @param dstRow
 * @param dstCol
 * @param element
 */
Board.prototype.updatePiecePosition = function (srcRow, srcCol, dstRow, dstCol, element) {
    this.setElementAt(srcRow, srcCol, "space");
    this.setElementAt(dstRow, dstCol, element);
}


/*************** Getters and Setters *********************/

/**
 * Returns the board matrix
 * @returns {Array}
 */
Board.prototype.getBoard = function () {
    return this.board;
}

/**
 * Sets the board matrix
 * @param encoded_board
 */
Board.prototype.setBoard = function (encoded_board) {
    this.plBoardParser(encoded_board);
    this.length = this.board.length;
}

/**
 * Returns board length
 * @returns {Number|*}
 */
Board.prototype.getBoardLength = function () {
    return this.length;
}

/**
 * Returns current element at the given coordinates
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
 * Sets the element at the given coordinates
 * @param Row
 * @param Col
 * @param element
 * @returns {string}
 */
Board.prototype.setElementAt = function (Row, Col, element) {
    if(!this.validPosition(Row, Col))
        return "Invalid Position";
    this.board[Row][Col] = element;
}
