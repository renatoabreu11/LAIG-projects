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
    REQUEST: 6,
    MOVIE: 7,
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

    this.savedGames = [];
    this.actualMovie = null;

    this.gameSequence = null;
    this.currentMove = null;

    this.player1 = new Player("blue",0, false, scene);
    this.player2 = new Player("red",0, false, scene);
    this.currentPlayer = null;

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
 * Initializes the game accordingly to the user input and sets up a new board given by prolog via server request
 * @param mode
 * @param difficulty
 */
Nodes.prototype.initializeGame = function (mode, difficulty) {
    var nodes = this;
    this.client.makeRequest("getFinalBoard", function(data){
        nodes.initializeBoard(data);
        nodes.startGame(mode, difficulty);
    });
}

/**
 * Initializes the visualisation of a sequence of plays in a saved game
 * @param name
 */
Nodes.prototype.initializeMovie = function (movieName) {
    for(var i = 0; i < this.savedGames.length; i++){
        if(this.savedGames[i].getName() == movieName){
            this.actualMovie = i;
            this.savedGames[i].setMoveIndex(-1);
            break;
        }
    }
    var nodes = this;

    this.client.makeRequest("getFinalBoard", function(data){
        nodes.state = Nodes.gameState.MOVIE;
        nodes.initializeBoard(data);
        nodes.updateMovie();
    });
}

/**
 * Sets nodes board and initializes all tiles and pieces accordingly to the board.
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

/**
 * Given a mode and difficulty, creates the needed variables to play a nodes game
 * @param mode
 * @param difficulty
 */
Nodes.prototype.startGame = function (mode, difficulty) {
    if (mode == "pvp") {
        this.mode = Nodes.mode.PvP;
        this.difficulty = Nodes.difficulty.NONE;
        this.state = Nodes.gameState.PIECE_SELECTION;
        this.player1.setIsBot(false);
        this.player2.setIsBot(false);
    } else if (mode == "pvc") {
        this.mode = Nodes.mode.PvC;
        if (difficulty == "easy")
            this.difficulty = Nodes.difficulty.EASY;
        else
            this.difficulty = Nodes.difficulty.MEDIUM;

        this.player1.setIsBot(false);
        this.player2.setIsBot(true);
        this.state = Nodes.gameState.PIECE_SELECTION;
    } else if (mode == "cvc") {
        this.mode = Nodes.mode.CvC;
        this.state = Nodes.gameState.AI_TURN;
        if (difficulty == "easy")
            this.difficulty = Nodes.difficulty.EASY;
        else
            this.difficulty = Nodes.difficulty.MEDIUM;

        this.player1.setIsBot(true);
        this.player2.setIsBot(true);
    }

    this.gameSequence = new Sequence();
    this.currentMove = new Move(this.scene, null, null, null);
    this.currentPlayer = this.player1;
}

/**
 *  Updates movie current move
 */
Nodes.prototype.updateMovie = function () {
    var movie = this.savedGames[this.actualMovie];
    movie.updateMoveIndex();

    var movieSequence = movie.getMoveSequence();
    if(movieSequence.getNumberOfPlays() == movie.getMoveIndex()){
        this.state = Nodes.gameState.MENU;
        this.actualMovie = null;
        this.gameSequence = null;
        this.currentMove = null;
        this.pieces = [];
        this.tiles = [];
        return;
    }

    this.currentMove = movie.getCurrentMove();
    var src = this.currentMove.getSrcTile();
    var dst = this.currentMove.getDstTile();
    var srcCoords = src.getCoordinatesAsString();
    var dstCoords = dst.getCoordinatesAsString();
    var newSrc = this.getTileFromCoords(srcCoords);
    var newDst = this.getTileFromCoords(dstCoords);
    this.currentMove.setSrcTile(newSrc);
    this.currentMove.setDstTile(newDst);
    this.currentMove.chooseAnimation();
    this.currentMove.piece.setAnimation(this.currentMove.animation);
    this.currentMove.timer = this.elapsedTime;

    this.board.updatePiecePosition(newSrc.getRow(), newSrc.getCol(), newDst.getRow(), newDst.getCol(), newSrc.getPiece().getUnit());
}

/**
 * Updates current move destiny tile, and then calls the function makeMove
 * @param dstTile
 */
Nodes.prototype.tryMovement = function (dstTile) {
    this.currentMove.setDstTile(dstTile);
    this.currentMove.makeMove(this.board, this.currentPlayer, this.client, this);
}

Nodes.prototype.parseMoveFromAI = function (info) {
    this.board.setBoard(info[0]);

    var nodesCoords = info[1].substr(1, info[1].length - 2);
    var tileCoords = info[2].substr(1, info[2].length - 2);

    var aux = tileCoords.split(",");
    var srcCoords = aux[0];
    var dstCoords = aux[1];

    var srcTile = this.getTileFromCoords(srcCoords);
    var dstTile = this.getTileFromCoords(dstCoords);
    var piece = srcTile.getPiece();
    piece.select();

    this.currentMove.setPiece(piece);
    this.currentMove.setDstTile(dstTile);
    this.currentMove.setMoveAnimation(this);
};

Nodes.prototype.moveAI = function () {
    var difficulty;
    var board = this.board.toPrologStruct();
    if(this.difficulty == Nodes.difficulty.EASY)
        difficulty = "easy";
    else difficulty = "medium";

    var request = "pickMove(" + difficulty + "," + board + "," + this.currentPlayer.getTeam() + ")";

    this.state = Nodes.gameState.REQUEST;
    var own = this;
    this.client.makeRequest(request, function(data) {
        var response = data.target.response;
        response = response.substr(1, response.length - 2);
        var info = response.split(";");
        own.parseMoveFromAI(info);
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

    //check if new user is in gameOver
    var own = this;
    var request = "endGame("+this.board.toPrologStruct()+","+this.currentPlayer.getTeam()+")";

    this.client.makeRequest(request, function(data) {
        var response = data.target.response;
        if(response=="f"){
            if(own.currentPlayer.getIsBot())
                own.state = Nodes.gameState.AI_TURN;
            else own.state = Nodes.gameState.PIECE_SELECTION;
        } else {
            own.state = Nodes.gameState.END_GAME;
        }
    });
};

Nodes.prototype.nextMove = function () {
    if(this.currentMove.isGameOver()){
        this.state = Nodes.gameState.END_GAME;
        return;
    }
    var movedPiece = this.currentMove.getPiece();
    if(movedPiece.getType() == "Node"){
        this.state = Nodes.gameState.END_TURN;
        this.gameSequence.setUndo(false);
        this.gameSequence.setUndoOnQueue(false);
        this.gameSequence.setUndoPlayerMoves(false);
        this.switchPlayer();
    } else{
        if(this.currentPlayer.getIsBot())
            this.state = Nodes.gameState.AI_TURN;
        else
            this.state = Nodes.gameState.PIECE_SELECTION;
    }

    this.currentMove.getPiece().deselect();

    if(this.gameSequence.getUndo())
       this.gameSequence.setUndo(false);

    if(this.gameSequence.getUndoOnQueue()){
        this.gameSequence.setUndoOnQueue(false);
        this.undoLastMove();
    } else if(this.gameSequence.getUndoPlayerMoves())
        this.resetPlayerMoves();
    else
        this.currentMove = new Move(this.scene, null, null, null);
}

Nodes.prototype.undoLastMove = function () {
    if(this.state == Nodes.gameState.PIECE_SELECTION)
    {
        var player = this.currentPlayer.getTeam();
        if(this.gameSequence.canUndo(player))
        {
            this.gameSequence.setUndo(true);
            this.resetMove();
        }
    } else if(this.state == Nodes.gameState.MOVE_ANIMATION && !this.currentPlayer.getIsBot()){
        this.gameSequence.setUndoOnQueue(true);
    }
}

Nodes.prototype.resetPlayerMoves = function () {
    if(this.state == Nodes.gameState.PIECE_SELECTION)
    {
        var player = this.currentPlayer.getTeam();
        if(this.gameSequence.canUndo(player))
        {
            this.gameSequence.setUndoPlayerMoves(true);
            this.gameSequence.setUndo(true);
            this.resetMove();
        }else{
            this.gameSequence.setUndoPlayerMoves(false);
            this.currentMove = new Move(this.scene, null, null, null);
            this.state = Nodes.gameState.PIECE_SELECTION;
        }
    }
}

Nodes.prototype.resetMove = function () {
    this.deselectPieces();
    this.currentMove = this.gameSequence.undoMove();
    this.currentMove.switchTiles();
    this.currentMove.setMoveAnimation(this);
    var srcTile = this.currentMove.getSrcTile();
    var dstTile = this.currentMove.getDstTile();
    var piece = this.currentMove.getPiece();
    this.board.updatePiecePosition(srcTile.getRow(), srcTile.getCol(), dstTile.getRow(), dstTile.getCol(), piece.getUnit());
}

Nodes.prototype.deselectPieces = function () {
    for(var i = 0; i < this.pieces.length; i++){
        this.pieces[i].deselect();
    }
}
/**
 *
 */
Nodes.prototype.display= function(){
    this.scene.pushMatrix();
    if(this.board != null)
        this.board.display();

    this.scene.pushMatrix();
    this.scene.translate(4, 0, 4);
    for(var i = 0; i < this.tiles.length; i++){
        this.cellAppearance.apply();

        var pickingMode = false;
        if(this.state == Nodes.gameState.PIECE_SELECTION)
            pickingMode = true;
        this.tiles[i].display(this.currentPlayer, this.currentMove, pickingMode, this.player1, this.player2);
    }

    this.scene.popMatrix();
    this.scene.popMatrix();
}

Nodes.prototype.saveGame = function () {
    var index = this.savedGames.length + 1;
    var saveGame = new Save(this.gameSequence, null, this.player1, this.player2, this.mode, this.difficulty, index);
    this.savedGames.push(saveGame);
    this.scene.addMovie();
    this.pieces = [];
    this.tiles = [];

    this.mode = Nodes.mode.NONE;
    this.difficulty = Nodes.difficulty.NONE;
    this.state = Nodes.gameState.MENU;

    this.gameSequence = null;
    this.currentMove = null;
    this.currentPlayer = null;
};


Nodes.prototype.update = function(currTime, player1, player2) {
    if (this.initialTime == 0) {
        this.initialTime = currTime;
    }
    this.elapsedTime = (currTime - this.initialTime)/1000;

    if(this.state != Nodes.gameState.MOVIE){
        this.player1.updateAppear(player1);
        this.player2.updateAppear(player2);
    }

    if(this.state == Nodes.gameState.END_GAME){
        this.saveGame();
    }

    if(this.state == Nodes.gameState.MOVIE){
        var diff = this.elapsedTime - this.currentMove.getInitialTime();
        if(diff > this.currentMove.getAnimation().getSpan()) {
            this.currentMove.getPiece().setAnimation(null);
            this.currentMove.movePiece();
            this.updateMovie();
        } else {
            this.currentMove.display(diff);
        }
    }

    if(this.state == Nodes.gameState.MOVE_ANIMATION){
        var diff = this.elapsedTime - this.currentMove.getInitialTime();
        if(diff > this.currentMove.getAnimation().getSpan()) {
            this.currentMove.getPiece().setAnimation(null);
            if(!this.gameSequence.getUndo()) {
                this.gameSequence.addMove(this.currentMove);
            }
            this.currentMove.movePiece();
            this.nextMove();
        } else {
            this.currentMove.display(diff);
        }
    }

    if((this.mode == Nodes.mode.CvC || this.mode == Nodes.mode.PvC) && this.state == Nodes.gameState.AI_TURN){
        this.moveAI();
    }
}

/****************************************** Getters and setters  ******************************************************/

/**
 * Returns the current board in use
 * @returns {Board}
 */
Nodes.prototype.getBoard = function(){
    return this.board;
}

/**
 * Returns the current client object
 * @returns {Client}
 */
Nodes.prototype.getClient = function(){
    return this.client;
}

/**
 * Returns the player which is playing
 * @returns {null|Player|*}
 */
Nodes.prototype.getPlayer = function(){
    return this.currentPlayer;
}

/**
 * Returns an array with all saved games
 * @returns {Array}
 */
Nodes.prototype.getSavedGames = function () {
    return this.savedGames;
}

/**
 * Returns the current move object
 * @returns {Move|null|*}
 */
Nodes.prototype.getCurrentMove = function () {
    return this.currentMove;
}

/**
 * Returns Nodes actual state
 * @returns {number|*}
 */
Nodes.prototype.getState = function () {
    return this.state;
}

/**
 * Given a string Row-Col, returns the tile in that position
 * @param coords
 * @returns {*}
 */
Nodes.prototype.getTileFromCoords = function (coords) {
    for(var i = 0; i < this.tiles.length; i++){
        if(this.tiles[i].getCoordinatesAsString() == coords)
            return this.tiles[i];
    }
}
