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
    PLAY: 1,
    MOVIE: 2,
}

Nodes.playState = {
    PIECE_SELECTION: 0,
    MOVE_ANIMATION: 1,
    END_TURN: 2,
    END_GAME: 3,
    AI_TURN: 4,
    REQUEST: 5,
    NONE: 6,
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
    this.highlightedTiles = [];
    this.board = new Board(scene, []);

    this.mode = Nodes.mode.NONE;
    this.difficulty = Nodes.difficulty.NONE;
    this.playState = Nodes.playState.NONE;
    this.gameState = Nodes.gameState.MENU;

    this.savedGames = [];
    this.actualMovie = null;

    this.gameSequence = null;
    this.currentMove = null;

    this.player1 = new Player("blue",0, false, scene);
    this.player2 = new Player("red",0, false, scene);
    this.currentPlayer = null;

    this.elapsedTime = 0;
    this.initialTime = 0;
    this.turnFinishingTime=-1;

    this.cellAppearance = new CGFappearance(this.scene);
    this.cellAppearance.loadTexture('../res/transparent.png');

    this.highlightAppearance = new CGFappearance(this.scene);
    this.highlightAppearance.loadTexture('../res/ice.jpg');

    this.cellShader = new CGFshader(this.scene.gl, "shaders/transparent.vert", "shaders/transparent.frag");
    this.cellShader.setUniformsValues({
        uSampler2: 1,
    });

    this.selectedShader = new CGFshader(this.scene.gl, "shaders/selected.vert", "shaders/selected.frag");
}

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
        nodes.scene.transitionCam=null;
        var randomValue = Math.floor((Math.random() * 10) + 1);
        if(randomValue > 5){
            nodes.currentPlayer = nodes.player1;
            nodes.scene.switchCamera("player1View2", "camTransition2");
        }else{
            nodes.currentPlayer = nodes.player2;
            nodes.scene.switchCamera("player2View2", "camTransition1");
        }

        nodes.initializeBoard(data);
        setTimeout(function(){
            nodes.startGame(mode, difficulty);
        }, 1500);
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
        nodes.scene.transitionCam=null;
        nodes.scene.switchCamera("lateralView", "camTransition1");
        nodes.initializeBoard(data);
        setTimeout(function(){
            nodes.playState = Nodes.playState.NONE;
            nodes.gameState = Nodes.gameState.MOVIE;
            nodes.updateMovie();
        }, 1500);
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
        this.playState = Nodes.playState.PIECE_SELECTION;
        this.gameState = Nodes.gameState.PLAY;
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
        this.playState = Nodes.playState.PIECE_SELECTION;
        this.gameState = Nodes.gameState.PLAY;
    } else if (mode == "cvc") {
        this.mode = Nodes.mode.CvC;
        this.playState = Nodes.playState.AI_TURN;
        this.gameState = Nodes.gameState.PLAY;
        if (difficulty == "easy")
            this.difficulty = Nodes.difficulty.EASY;
        else
            this.difficulty = Nodes.difficulty.MEDIUM;

        this.player1.setIsBot(true);
        this.player2.setIsBot(true);
    }

    this.gameSequence = new Sequence();
    this.currentMove = new Move(this.scene, null, null, null);
    this.turnFinishingTime=this.elapsedTime+this.scene.getTurnTime();
}

/**
 *  Updates movie current move
 */
Nodes.prototype.updateMovie = function () {
    var movie = this.savedGames[this.actualMovie];
    movie.updateMoveIndex();

    var movieSequence = movie.getMoveSequence();
    if(movieSequence.getNumberOfPlays() == movie.getMoveIndex()){
        this.resetMovie();
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
 * Accordingly to the picking, selects a piece
 * @param obj
 */
Nodes.prototype.selectPiece = function (obj) {
    var currentPiece = this.currentMove.getPiece();

    var pieceSelection = false;

    if(currentPiece == null){
        pieceSelection = true;
    } else if(obj != currentPiece){
        currentPiece.setSelected(false);
        pieceSelection = true;
    }

    if(pieceSelection)
    {
        obj.setSelected(true);
        this.currentMove.setPiece(obj);

        var tile = this.currentMove.getSrcTile();
        var request = "getPieceMoves(" + this.board.toPrologStruct() + "," + tile.getRow() + "," + tile.getCol() + ")";
        var own = this;
        this.client.makeRequest(request, function(data) {
            var response = data.target.response;
            response = response.substr(1, response.length - 2);
            var info = response.split(",");
            own.highlightTiles(info);
        });
    }
}

/**
 * Updates current move destiny tile, and then calls the function makeMove
 * @param dstTile
 */
Nodes.prototype.tryMovement = function (dstTile) {
    this.currentMove.setDstTile(dstTile);
    this.currentMove.makeMove(this.board, this.currentPlayer, this.client, this);
}

/**
 * Adds current move to the game sequence and then creates a new Move
 */
Nodes.prototype.nextMove = function () {
    this.resetHighlights();

    if(this.currentMove.isGameOver()){
        this.playState = Nodes.playState.END_GAME;
        return;
    }

    var movedPiece = this.currentMove.getPiece();
    if(movedPiece.getType() == "Node"){
        this.playState = Nodes.playState.END_TURN;
        this.turnFinishingTime=-1;
        this.gameSequence.setUndo(false);
        this.gameSequence.setUndoOnQueue(false);
        this.gameSequence.setUndoPlayerMoves(false);
        this.switchPlayer();
    } else{
        if(this.currentPlayer.getIsBot())
            this.playState = Nodes.playState.AI_TURN;
        else
            this.playState = Nodes.playState.PIECE_SELECTION;
    }

    this.currentMove.getPiece().setSelected(false);

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

/**
 * Requests pl server for a new bot move
 */
Nodes.prototype.moveAI = function () {
    var difficulty;
    var board = this.board.toPrologStruct();
    if(this.difficulty == Nodes.difficulty.EASY)
        difficulty = "easy";
    else difficulty = "medium";

    var request = "pickMove(" + difficulty + "," + board + "," + this.currentPlayer.getTeam() + ")";

    this.playState = Nodes.playState.REQUEST;
    var own = this;
    this.client.makeRequest(request, function(data) {
        var response = data.target.response;
        response = response.substr(1, response.length - 2);
        var info = response.split(";");
        own.parseMoveFromAI(info);
    });
}

/**
 * Parses the responde given by prolog when asking for a bot move
 * @param info
 */
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
    piece.setSelected(true);

    this.currentMove.setPiece(piece);
    this.currentMove.setDstTile(dstTile);
    this.currentMove.setMoveAnimation(this);
};

/**
 * After the player terminates its turn, this function switches the current player
 */
Nodes.prototype.switchPlayer = function () {
    if(this.currentPlayer == this.player1)
        this.currentPlayer = this.player2;
    else this.currentPlayer = this.player1;

    var own = this;
    var request = "endGame("+this.board.toPrologStruct()+","+this.currentPlayer.getTeam()+")";

    this.client.makeRequest(request, function(data) {
        var response = data.target.response;
        if(response=="f"){
            own.turnFinishingTime=own.elapsedTime+own.scene.getTurnTime();
            if(own.currentPlayer.getIsBot())
                own.playState = Nodes.playState.AI_TURN;
            else own.playState = Nodes.playState.PIECE_SELECTION;
            own.scene.switchCamera("player2View2", "camTransition1");
        } else {
            own.playState = Nodes.playState.END_GAME;
        }
    });
};

/**
 * Saves a nodes game after its end, adds the save to savedGames array and updates the movie folder interface
 */
Nodes.prototype.saveGame = function () {
    var index = this.savedGames.length + 1;
    var winner = this.currentPlayer==this.player1?this.player2:this.player1;
    winner.score++;
    var saveGame = new Save(this.gameSequence, winner, this.mode, this.difficulty, index);
    this.savedGames.push(saveGame);
    this.scene.addMovie();
    this.resetGame();
};

/**
 * Resets variables used in a nodes game
 */
Nodes.prototype.resetGame = function () {
    this.pieces = [];
    this.tiles = [];
    this.resetHighlights();

    this.scene.transitionCam=null;
    this.scene.switchCamera("menuView", "camTransition3");
    this.difficulty = Nodes.difficulty.NONE;
    this.playState = Nodes.playState.NONE;
    this.gameState = Nodes.gameState.MENU;

    this.gameSequence = null;
    this.currentMove = null;
    this.currentPlayer = null;
}

/**
 * Resets variables used in a movie sequence
 */
Nodes.prototype.resetMovie = function () {
    var diff = this.elapsedTime - this.currentMove.getInitialTime();
    if(diff > this.currentMove.getAnimation().getSpan()) {
        this.currentMove.getPiece().setAnimation(null);
        this.currentMove.movePiece();
    }
    this.scene.transitionCam=null;
    this.scene.switchCamera("menuView", "camTransition3");
    this.playState = Nodes.playState.NONE;
    this.gameState = Nodes.gameState.MENU;
    this.actualMovie = null;
    this.gameSequence = null;
    this.currentMove = null;
    this.pieces = [];
    this.tiles = [];
}

/**
 * Undo last move if it possible and the current state is PieceSelection
 */
Nodes.prototype.undoLastMove = function () {
    if(this.playState == Nodes.playState.PIECE_SELECTION)
    {
        var player = this.currentPlayer.getTeam();
        if(this.gameSequence.canUndo(player))
        {
            this.gameSequence.setUndo(true);
            this.resetMove();
        }
    } else if(this.playState == Nodes.playState.MOVE_ANIMATION && !this.currentPlayer.getIsBot()){
        this.gameSequence.setUndoOnQueue(true);
    }
}

/**
 * Resets all player moves in the current turn
 */
Nodes.prototype.resetPlayerMoves = function () {
    if(this.playState == Nodes.playState.PIECE_SELECTION)
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
            this.playState = Nodes.playState.PIECE_SELECTION;
        }
    }
}

/**
 * Resets a move
 */
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

/**
 * Highlights tiles where it is possible to move the current selected piece
 * @param validMoves
 */
Nodes.prototype.highlightTiles = function (validMoves) {
    this.resetHighlights();

    for(var i = 0; i < validMoves.length; i++){
        var tile = this.getTileFromCoords(validMoves[i]);
        if(tile != false){
            tile.setHighlight(true);
            this.highlightedTiles.push(tile);
        }
    }
}

/**
 * Removes all highlights
 */
Nodes.prototype.resetHighlights = function () {
    for(tile of this.highlightedTiles){
        tile.setHighlight(false);
    }
    this.highlightedTiles = [];
}

/**
 * Displays nodes and all its elements
 */
Nodes.prototype.display= function(){
    if(this.gameState != Nodes.gameState.MENU){
        this.scene.pushMatrix();
        if(this.board != null)
            this.board.display();

        this.scene.pushMatrix();
        this.scene.translate(4, 0, 4);
        for(var i = 0; i < this.tiles.length; i++){

            var pickingMode = false;
            if(this.playState == Nodes.playState.PIECE_SELECTION)
                pickingMode = true;

            this.tiles[i].display(this.currentPlayer, this.currentMove, pickingMode, this.player1, this.player2);
        }

        this.scene.popMatrix();
        this.scene.popMatrix();
    }
}

/**
 * Updates nodes accordingly to the current state
 * @param currTime
 * @param player1
 * @param player2
 */
Nodes.prototype.update = function(currTime, player1, player2) {
    if (this.initialTime == 0) {
        this.initialTime = currTime;
    }
    this.elapsedTime = (currTime - this.initialTime)/1000;

    if(this.elapsedTime > this.turnFinishingTime && (this.playState == Nodes.playState.PIECE_SELECTION || this.playState == Nodes.playState.AI_TURN)){
        this.playState = Nodes.playState.END_GAME;
    }

    if(this.gameState == Nodes.gameState.PLAY){
        var appearChange1 = this.player1.updateAppear(player1);
        var appearChange2 = this.player2.updateAppear(player2);

        if(this.currentPlayer == this.player1 && appearChange1){
            var colour = this.player1.getAppearAsRGB();
            this.selectedShader.setUniformsValues({
                colour: colour,
            });

        } else if(this.currentPlayer == this.player1 && appearChange2){
            var colour = this.player2.getAppearAsRGB();
            this.selectedShader.setUniformsValues({
                colour: colour,
            });
        }
    }

    if(this.playState == Nodes.playState.END_GAME){
        this.saveGame();
    }

    if(this.gameState == Nodes.gameState.MOVIE){
        var diff = this.elapsedTime - this.currentMove.getInitialTime();
        if(diff > this.currentMove.getAnimation().getSpan()) {
            this.currentMove.getPiece().setAnimation(null);
            this.currentMove.movePiece();
            this.updateMovie();
        } else {
            this.currentMove.display(diff);
        }
    }

    if(this.playState == Nodes.playState.MOVE_ANIMATION){
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

    if((this.mode == Nodes.mode.CvC || this.mode == Nodes.mode.PvC) && this.playState == Nodes.playState.AI_TURN){
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
Nodes.prototype.getCurrentPlayer = function(){
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
 * Returns play state
 * @returns {number|*}
 */
Nodes.prototype.getPlayState = function () {
    return this.playState;
}

/**
 * Returns game state
 * @returns {number|*}
 */
Nodes.prototype.getGameState = function () {
    return this.gameState;
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
    return false;
}

/**
 * This function removes the selection in all highlighted pieces
 */
Nodes.prototype.deselectPieces = function () {
    for(var i = 0; i < this.pieces.length; i++){
        this.pieces[i].setSelected(false);
    }
}
