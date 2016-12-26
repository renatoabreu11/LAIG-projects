/**
 * Move
 * @constructor
 */

function Move(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.piece = null;
    this.srcTile = null;
    this.dstTile = null;
}

/**
 *
 * @type {Move}
 */
Move.prototype = Object.create(CGFobject.prototype);
Move.prototype.constructor = Move;

Move.prototype.makeMove = function (board, player, client) {
    if(this.dstTile.getPiece() != null || this.srcTile.getPiece() == null)
        return;

    var plBoard = board.toPrologStruct();
    var team = player.getTeam();
    var own = this;
    var request = "move("+plBoard+"," + team + "," + "Piece,"+ "FinalBoard,"+
        this.srcTile.row + "-" + this.srcTile.col + "," +
        this.dstTile.row + "-" + this.dstTile.col + ")";

    client.makeRequest(request, function(data) {
        board.setBoard(data.target.response);
        this.srcTile.setPiece(null);
        this.dstTile.setPiece(this.piece);
    });
}

Move.prototype.display = function () {
    //display da transição da peça
}

