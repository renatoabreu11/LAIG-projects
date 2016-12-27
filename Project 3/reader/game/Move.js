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
    this.timer = 0;
    this.gameOver=false;
}

/**
 *
 * @type {Move}
 */
Move.prototype = Object.create(CGFobject.prototype);
Move.prototype.constructor = Move;

Move.prototype.isGameOver = function() {
    return this.gameOver;
}

Move.prototype.setPiece = function (piece) {
    this.piece = piece;
    this.srcTile = piece.getTile();
}

Move.prototype.getPiece = function () {
    return this.piece;
}

Move.prototype.getSrcTile = function () {
    return this.srcTile;
}

Move.prototype.getDstTile = function () {
    return this.dstTile;
}

Move.prototype.getAnimation = function () {
    return this.animation;
}

Move.prototype.setDstTile = function (dest) {
    this.dstTile = dest;
}

Move.prototype.switchTiles = function () {
    var aux = this.srcTile;
    this.srcTile = this.dstTile;
    this.dstTile = aux;
    this.piece.select();
}

Move.prototype.setMoveAnimation = function (nodes) {
    this.chooseAnimation();
    this.piece.setAnimation(this.animation);
    nodes.state = Nodes.gameState.MOVE_ANIMATION;
    this.timer = nodes.elapsedTime;
}

Move.prototype.makeMove = function (board, player, client, nodes) {
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
            return false;
        }
        
        var gameOver = response.slice(-2,-1);
        var plBoard = response.slice(1,-3);
        if(gameOver=="t"){
            own.gameOver=true;
        }
        board.setBoard(plBoard);
        own.setMoveAnimation(nodes);
    });
}

Move.prototype.chooseAnimation = function(){
    var xDif = this.dstTile.row - this.srcTile.row; //offset to move in X
    var zDif = this.dstTile.col - this.srcTile.col; //offset to move in Z
    
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
    var index = this.scene.graph.checkIfExists(this.scene.graph.animations, id);
    if (index == -1) {
        console.log("No animation found for this movement!");
    } else this.animation=this.scene.graph.animations[index];

}

Move.prototype.display = function (currTime) {
    this.scene.pushMatrix();
    this.piece.timer=currTime;
    this.scene.popMatrix();
}

Move.prototype.getInitialTime = function () {
    return this.timer;
}

Move.prototype.movePiece = function() {
    this.srcTile.setPiece(null);
    this.dstTile.setPiece(this.piece);
    this.piece.setTile(this.dstTile);
};