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
    this.animation = null;
}

/**
 *
 * @type {Move}
 */
Move.prototype = Object.create(CGFobject.prototype);
Move.prototype.constructor = Move;

Move.prototype.setPiece = function (piece) {
    this.piece = piece;
    this.srcTile = piece.getTile();
}

Move.prototype.getPiece = function () {
    return this.piece;
}

Move.prototype.setDstTile = function (dest) {
    this.dstTile = dest;
}

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
        own.piece.setTile(own.dstTile);

        own.animation = own.chooseAnimation();
    });
}

Move.prototype.chooseAnimation = function(){
    var xDif = this.dstTile.row - this.srcTile.row; //offset to move in X
    var zDif = this.dstTile.row - this.srcTile.row; //offset to move in Z
    
    var type;
    if(Math.abs(xDif)+Math.abs(zDif) == 2)
        type="jump";
    else type="move";

    var direction;
    if(xDif==0){ //move Z
        if(zDif<0)
            direction="Z-";
        else direction="Z+";
    } else { //move X
        if(xDif<0)
            direction="X+";
        else direction="X-";
    }

    var id = type+direction;
    /*var index = this.scene.scenegraph.checkIfExists(this.scene.scenegraph.animations, id);
    if (index == -1) {
        console.log("No animation found");
    } else this.animation=this.scene.scenegraph[index];*/

    console.log(id);
}

Move.prototype.display = function () {
    //display da transição da peça
}

