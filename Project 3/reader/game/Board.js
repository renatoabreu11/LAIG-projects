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

    colourS = vec4.create();
    vec4.set(colourS, 1, 0, 0, 1);

    du=10;
    dv=10;

    su=-1;
    sv=-1;

    this.nodesAppearance = new CGFappearance(this.scene);
    this.nodesAppearance.loadTexture('../res/nodesboard.png');
    this.nodesBoard = new Plane(this.scene, du, dv, 31, 31);
    this.boardShader = new CGFshader(this.scene.gl, "shaders/nodesboard.vert", "shaders/nodesboard.frag");
    this.boardShader.setUniformsValues({
        uSampler2: 1,
        cs: colourS,
        du: du,
        dv: dv,
        su: su,
        sv: sv
    });
}

/**
 *
 * @type {Board}
 */
Board.prototype = Object.create(CGFobject.prototype);
Board.prototype.constructor = Board;

/**
 *
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

Board.prototype.getBoard = function () {
    return this.board;
}

Board.prototype.setBoard = function (encoded_board) {
    this.plBoardParser(encoded_board);
    this.length = this.board.length;
}

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

Board.prototype.display = function () {
    this.scene.pushMatrix();
    this.nodesAppearance.apply();
    this.scene.setActiveShader(this.boardShader);
    this.scene.scale(1.03, 1.03, 1.03);
    this.scene.rotate(-90*Math.PI/180, 0, 1, 0);
    this.scene.rotate(-90*Math.PI/180, 1, 0, 0);
    this.nodesBoard.display();
    this.scene.setActiveShader(this.scene.defaultShader);
    this.scene.popMatrix();
}

