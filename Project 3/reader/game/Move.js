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

Move.prototype = Object.create(CGFobject.prototype);
Move.prototype.constructor = Move;

/**
 * Tries to make a move by requesting prolog to check if it valid
 * @param board
 * @param player
 * @param client
 * @param nodes
 */
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

/**
 * Chooses an animation -> move or jump
 */
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
            direction="Z+";
        else direction="Z-";
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

/**
 * displays the move animation
 * @param currTime
 */
Move.prototype.display = function (currTime) {
    this.scene.pushMatrix();
    this.piece.timer=currTime;
    this.scene.popMatrix();
}

/**
 * Moves a piece from source tile to destiny tile
 */
Move.prototype.movePiece = function() {
    this.srcTile.setPiece(null);
    this.dstTile.setPiece(this.piece);
    this.piece.setTile(this.dstTile);
};

/**
 * Switch source and destiny tiles
 */
Move.prototype.switchTiles = function () {
    var aux = this.srcTile;
    this.srcTile = this.dstTile;
    this.dstTile = aux;
    this.piece.setSelected(true);
}

/***************** Getters and Setters ***********************/

/**
 * Checks if occurred game over with this move
 * @returns {boolean}
 */
Move.prototype.isGameOver = function() {
    return this.gameOver;
}

/**
 * Sets the piece to be moved
 * @param piece
 */
Move.prototype.setPiece = function (piece) {
    this.piece = piece;
    this.srcTile = piece.getTile();
}

/**
 * Returns the piece to be moved
 * @returns {*|*|null}
 */
Move.prototype.getPiece = function () {
    return this.piece;
}

/**
 * Sets move source tile
 * @param srcTile
 */
Move.prototype.setSrcTile = function (srcTile) {
    this.srcTile = srcTile;
    this.piece = this.srcTile.getPiece();
}

/**
 * Returns source tile
 * @returns {*|null|null|*}
 */
Move.prototype.getSrcTile = function () {
    return this.srcTile;
}

/**
 * Changes move destiny tile
 * @param dest
 */
Move.prototype.setDstTile = function (dest) {
    this.dstTile = dest;
}

/**
 * Returns the destiny tile
 * @returns {*|null}
 */
Move.prototype.getDstTile = function () {
    return this.dstTile;
}

/**
 * Sets move animation
 * @param nodes
 */
Move.prototype.setMoveAnimation = function (nodes) {
    this.chooseAnimation();
    this.piece.setAnimation(this.animation);
    nodes.state = Nodes.gameState.MOVE_ANIMATION;
    this.timer = nodes.elapsedTime;
}

/**
 * Returns the animation used in this move
 * @returns {*|null}
 */
Move.prototype.getAnimation = function () {
    return this.animation;
}

/**
 * Returns initial animation time
 * @returns {*|number}
 */
Move.prototype.getInitialTime = function () {
    return this.timer;
}
