/**
 * Tile
 * @constructor
 */
function Tile(scene, element, row, col) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.piece = null; // reference to a piece or null
    this.element = element; // space, empty or unit name
    this.row = row;
    this.col = col;
    this.highlight = false;

    this.object = new Circle(this.scene, 0.4, 12);
}

Tile.prototype = Object.create(CGFobject.prototype);
Tile.prototype.constructor = Tile;


/**
 * Displays tile and respective piece, if it exists
 * @param currentPlayer
 * @param currentMove
 * @param pickingMode
 * @param player1
 * @param player2
 */
Tile.prototype.display = function (currentPlayer, currentMove, pickingMode, player1, player2) {
    this.scene.pushMatrix();
    this.scene.translate(-this.row, 0.03, -this.col);

    if(this.piece != null) {
        if(currentPlayer != null && currentPlayer.getTeam() == this.piece.getColour() && pickingMode){
            this.scene.registerForPick(this.scene.pickObjectID, this.piece);
            this.scene.pickObjectID++;
        }
        if(this.piece.getColour() == player1.getTeam())
            player1.getAppear().apply();
        else player2.getAppear().apply();
        this.piece.display();
    }

    if(currentMove != null)
        if(currentMove.getPiece() != null && this.piece == null && this.element != "empty" && pickingMode){
            this.scene.registerForPick(this.scene.pickObjectID, this);
            this.scene.pickObjectID++;
        }

    if(this.highlight){
        this.scene.setActiveShader(this.scene.nodes.cellShader);
        this.scene.nodes.highlightAppearance.apply();
    }
    else this.scene.nodes.cellAppearance.apply();
    this.scene.rotate(-90 * Math.PI / 180, 0, 1, 0);
    this.scene.rotate(-90 * Math.PI / 180, 1, 0, 0);
    this.object.display();
    if(this.highlight)
        this.scene.setActiveShader(this.scene.defaultShader);
    this.scene.clearPickRegistration();
    this.scene.popMatrix();
}

/******************** Getters and Setters *****************************/

/**
 * Sets current piece
 * @param piece
 */
Tile.prototype.setPiece = function (piece) {
    this.piece = piece;
    if(this.piece != null)
        this.element = this.piece.getUnit();
    else this.element = "space";
}

/**
 * Returns piece
 * @returns {*|null}
 */
Tile.prototype.getPiece = function () {
    return this.piece;
}

/**
 * Returns tile's row
 * @returns {*}
 */
Tile.prototype.getRow = function () {
    return this.row;
}

/**
 * Returns tile's col
 * @returns {*}
 */
Tile.prototype.getCol = function () {
    return this.col;
}

/**
 * Returns coordinates as string in format: Row-Col
 * @returns {string}
 */
Tile.prototype.getCoordinatesAsString = function () {
    return (this.row + "-" + this.col);
}

/**
 * Sets the highlight value.
 * @param value
 */
Tile.prototype.setHighlight = function (value) {
    this.highlight = value;
}