Nodes.mode = {
    PvP: 0,
    PvC: 1,
    CvC: 2,
    NONE: 3,
}

Nodes.difficulty = {
    EASY: 0,
    MEDIUM: 1,
    NONE: 2,
}

Nodes.gameState = {
    MENU: 0,
    PIECE_SELECTION: 1,
    MOVE_ANIMATION: 2,
    END_TURN: 3,
    END_GAME: 4,
    AI_TURN: 5,
}

/**
 * Nodes
 * @constructor
 */
function Nodes(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.client= new Client(8081);
    this.pieces = [];
    this.tiles = [];
    this.board = new Board(scene, []);

    this.mode = Nodes.mode.NONE;
    this.difficulty = Nodes.difficulty.NONE;
    this.state = Nodes.gameState.MENU;

    this.gameSequence = new Sequence();
    this.currentMove = new Move(this.scene, null, null, null)

    this.player1 = new Player("blue",0, false);
    this.player2 = new Player("red",0, false);
    this.currentPlayer = this.player1;

    this.elapsedTime = 0;
    this.initialTime = 0;

    this.cellAppearance = new CGFappearance(this.scene);
    this.cellAppearance.loadTexture('../res/ice.jpg');
}

/**
 *
 * @type {Nodes}
 */
Nodes.prototype = Object.create(CGFobject.prototype);
Nodes.prototype.constructor = Nodes;

/**
 *
 */
Nodes.prototype.initializeGame = function (mode, difficulty) {
    var nodes = this;
    this.client.makeRequest("getInitialBoard", function(data){
        nodes.initializeBoard(data);
        nodes.startGame(mode, difficulty);
    });
}

Nodes.prototype.getCurrentMove = function () {
    return this.currentMove;
}

Nodes.prototype.tryMovement = function (dstTile) {
    this.currentMove.setDstTile(dstTile);
    this.currentMove.makeMove(this.board, this.currentPlayer, this.client, this);
}

Nodes.prototype.moveAI = function () {
    var difficulty;
    var board = this.board.toPrologStruct();
    if(this.difficulty == Nodes.difficulty.EASY)
        difficulty = "easy";
    else difficulty = "medium";

    var request = "pickMove(" + difficulty + "," + board + ",FinalBoard," + this.currentPlayer.getTeam() + ",NodeRowI-NodeColI,NodeRowF-NodeColF)";
    console.log(request);

    this.client.makeRequest(request, function(data) {
        var response = data.target.response;
        console.log(response);
    });
}

Nodes.prototype.switchPlayer = function () {
    if(this.scene.transitionCam != null) //caso a transicao nao tenha acabado, nao permite iniciar uma nova
        return;
    transitionCam=[];
    transitionCam["newCam"]=this.scene.graph.getNextView();
    transitionCam["animation"]=this.scene.graph.animations[this.scene.graph.checkIfExists(this.scene.graph.animations, transitionCam["newCam"]["id"]=="player1" ? "camTransition1" : "camTransition2")];
    transitionCam["finishTime"]=this.scene.elapsedTime+transitionCam["animation"].span;
    this.scene.transitionCam=transitionCam;

    if(this.currentPlayer == this.player1)
        this.currentPlayer = this.player2;
    else this.currentPlayer = this.player1;

    if(this.currentPlayer.getIsBot())
        this.state = Nodes.gameState.AI_TURN;
    else this.state = Nodes.gameState.PIECE_SELECTION;
};

Nodes.prototype.nextMove = function () {
    var movedPiece = this.currentMove.getPiece();
    if(movedPiece.getType() == "Node"){
        this.state = Nodes.gameState.END_TURN;
        this.switchPlayer();
    } else{
        if(this.currentPlayer.getIsBot())
            this.state = Nodes.gameState.AI_TURN;
        else this.state = Nodes.gameState.PIECE_SELECTION;
    }
    this.gameSequence.addMove(this.currentMove);
    this.currentMove = new Move(this.scene, null, null, null);
}

Nodes.prototype.startGame = function (mode, difficulty) {console.log(mode);
    if (mode == "pvp") {
        this.mode = Nodes.mode.PvP;
        this.difficulty = Nodes.difficulty.NONE;
        this.state = Nodes.gameState.PIECE_SELECTION;
    } else if (mode == "pvc") {
        this.mode = Nodes.mode.PvC;
        if (difficulty == "easy")
            this.difficulty = Nodes.difficulty.EASY;
        else
            this.difficulty = Nodes.difficulty.MEDIUM;

    } else if (mode == "cvc") {
        this.mode = Nodes.mode.CvC;
        this.state = Nodes.gameState.AI_TURN;
        if (difficulty == "easy")
            this.difficulty = Nodes.difficulty.EASY;
        else
            this.difficulty = Nodes.difficulty.MEDIUM;
    }
}

/**
 *
 * @param data
 */
Nodes.prototype.initializeBoard = function (data) {
    this.board.setBoard(data.target.responseText);

    var b = this.board.getBoard();
    var length = this.board.getBoardLength();

    for (var i = 0; i < length; i++) {
        var row = b[i];
        for(var j = 0; j < length; j++){
            var element = row[j];
            var piece;
            if(element == "empty" || element == "space") {
                piece = null;
                var tile = new Tile(this.scene, element, i, j);
                this.tiles.push(tile);
            }else{
                var type;
                if(element.match(/Unit/g))
                    type = 'Unit';
                else type = 'Node';

                var colour;
                if(element.match(/blue/g))
                    colour = 'blue';
                else colour = 'red';

                var tile = new Tile(this.scene, element, i, j);
                this.tiles.push(tile);

                piece = new Piece(this.scene, element, type, colour);
                this.pieces.push(piece);
                tile.setPiece(piece);
                piece.setTile(tile);
            }
        }
    }
}

Nodes.prototype.deselectPieces = function () {
    for(var i = 0; i < this.pieces.length; i++){
        this.pieces[i].deselect();
    }
}

Nodes.prototype.getBoard = function(){
    return this.board;
}

Nodes.prototype.getClient = function(){
    return this.client;
}

Nodes.prototype.getPlayer = function(){
    return this.currentPlayer;
}

/**
 *
 */
Nodes.prototype.display= function(){
    this.scene.pushMatrix();
    if(this.board != null)
        this.board.display();

    this.scene.pushMatrix();
    this.scene.translate(4, 0, -4);
    for(var i = 0; i < this.tiles.length; i++){
        this.cellAppearance.apply();

        var pickingMode = false;
        if(this.state == Nodes.gameState.PIECE_SELECTION)
            pickingMode = true;

        this.tiles[i].display(this.currentPlayer.getTeam(), this.currentMove, pickingMode);
    }

    this.scene.popMatrix();
    this.scene.popMatrix();
}

Nodes.prototype.update = function(currTime) {
    if (this.initialTime == 0) {
        this.initialTime = currTime;
    }
    this.elapsedTime = (currTime - this.initialTime)/1000;

    if(this.state == Nodes.gameState.MOVE_ANIMATION){
        var diff = this.elapsedTime - this.currentMove.getInitialTime();
        if(diff > this.currentMove.getAnimation().getSpan()) {
            this.currentMove.getPiece().setAnimation(null);
            this.currentMove.movePiece();
            this.nextMove();
        } else {
            this.currentMove.display(diff); // TO DO
        }
    }

    if(this.mode == Nodes.mode.CvC && this.state == Nodes.gameState.AI_TURN){
        console.log(this);
        this.moveAI();
    }
}