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

Piece.prototype.display = function () {
    this.scene.pushMatrix();
    this.object.display();
    this.scene.popMatrix();
}