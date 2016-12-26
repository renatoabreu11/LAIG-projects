/**
 * Piece
 * @constructor
 */

function Piece(scene, unit, type, tile) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.unit = unit;
    this.type = type;
    this.tile = tile;

    if(this.type == "Node")
        this.object = new Node(scene);
    else this.object = new Unit(scene);

    this.isSelected = false;
    this.selected = new CGFappearance(this.scene);
    this.selected.loadTexture('../res/sand.jpg');
}

/**
 *
 * @type {Board}
 */
Piece.prototype = Object.create(CGFobject.prototype);
Piece.prototype.constructor = Piece;

Piece.prototype.setTile = function (tile) {
    this.tile = tile;
}

Piece.prototype.getTile = function () {
    return this.tile;
}

Piece.prototype.display = function () {
    this.scene.pushMatrix();
    if(this.isSelected)
        this.selected.apply();
    this.object.display();
    this.scene.popMatrix();
}

Piece.prototype.select = function () {
    this.isSelected=true;
}

Piece.prototype.deselect = function () {
    this.isSelected=false;
}