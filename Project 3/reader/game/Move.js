/**
 * Move
 * @constructor
 */

function Move(scene,piece,src,dest) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.piece = piece;
    this.srcTile = src;
    this.dstTile = dest;
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
        var response = data.target.response;
        if(response=="false"){
            console.log("Move.js says: Move failed!");
            return;
        }
        board.setBoard(response);
        own.srcTile.setPiece(null);
        own.dstTile.setPiece(own.piece);
    });
}

Move.prototype.display = function () {
    //display da transição da peça
}

