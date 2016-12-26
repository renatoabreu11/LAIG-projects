Nodes.mode = {
    PvP: 0,
    PvC_EASY: 1,
    PvC_MEDIUM: 2,
    CvC_EASY: 3,
    CvC_MEDIUM: 4,
    NONE: 5,
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

    this.gameSequence = new Sequence();
    this.currentMove = new Move(this.scene, null, null, null)

    var player1 = new Player("blue",0);
    var player2 = new Player("red",0);
    this.players = [player1, player2];
    this.currentPlayer = player1;

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
        //nodes.startGame(mode, difficulty);
    });
}

Nodes.prototype.getCurrentMove = function () {
    return this.currentMove;
}

Nodes.prototype.tryMovement = function (dstTile) {
    this.currentMove.setDstTile(dstTile);
    this.currentMove.makeMove(this.board, this.currentPlayer, this.client);
    this.gameSequence.addMove(this.currentMove);
    this.currentMove.getPiece().deselect();
    this.currentMove = new Move(this.scene, null, null, null);
}

Nodes.prototype.startGame = function (mode, difficulty) {
    var request;

    var board = this.board.toPrologStruct();
    if(mode == "pvp"){
        this.mode = Nodes.mode.PvP;
        request = "game(pvp, " + board + ", blue, none)";
    }else if(mode == "pvc"){
        if(difficulty == "easy"){
            this.mode = Nodes.mode.PvC_EASY;
            request = "game(pvc, " + board + ", blue, easy)";
        }
        else{
            this.mode = Nodes.mode.PvC_MEDIUM;
            request = "game(pvc, " + board + ", blue, medium)";
        }
    }else if(mode == "cvc"){
        if(difficulty == "easy"){
            this.mode = Nodes.mode.CvC_EASY;
            request = "game(cvc, " + board + ", blue, easy)";
        }
        else{
            this.mode = Nodes.mode.CvC_MEDIUM;
            request = "game(cvc, " + board + ", blue, medium)";
        }
    }
    this.client.makeRequest(request, function(data){
        console.log(data);
    });}

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

                console.log(colour)
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
        this.tiles[i].display(this.currentPlayer.getTeam(), this.currentMove);
    }

    this.scene.popMatrix();
    this.scene.popMatrix();
}