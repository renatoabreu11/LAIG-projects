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

    this.object = new Circle(this.scene, 0.4, 12);
}

/**
 *
 * @type {Board}
 */
Tile.prototype = Object.create(CGFobject.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.setPiece = function (piece) {
    this.piece = piece;
    if(this.piece != null)
        this.element = this.piece.getUnit();
    else this.element = "space";
}

Tile.prototype.getPiece = function () {
    return this.piece;
}

Tile.prototype.getRow = function () {
    return this.row;
}

Tile.prototype.getCol = function () {
    return this.col;
}

Tile.prototype.getCoordinatesAsString = function () {
    return (this.row + "-" + this.col);
}

Tile.prototype.display = function (currentPlayer, currentMove, pickingMode) {
    this.scene.pushMatrix();
    this.scene.translate(-this.row, 0.03, this.col);

    if(this.piece != null) {
        if(currentPlayer != null && currentPlayer.getTeam() == this.piece.getColour() && pickingMode){
            this.scene.registerForPick(this.scene.pickObjectID, this.piece);
            this.scene.pickObjectID++;
        }
        this.piece.display();
    }

    if(currentMove != null)
        if(currentMove.getPiece() != null && this.piece == null && this.element != "empty" && pickingMode){
            this.scene.registerForPick(this.scene.pickObjectID, this);
            this.scene.pickObjectID++;
        }
    this.scene.setDefaultAppearance();
    this.scene.rotate(-90 * Math.PI / 180, 0, 1, 0);
    this.scene.rotate(-90 * Math.PI / 180, 1, 0, 0);
    this.object.display();
    this.scene.clearPickRegistration();
    this.scene.popMatrix();
}