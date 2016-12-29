/**
 * Piece
 * @constructor
 */

function Piece(scene, unit, type, colour) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.unit = unit;
    this.type = type;
    this.tile = null;
    this.colour = colour;
    this.animation = null;
    this.timer = null;

    if(this.type == "Node")
        this.object = new Node(scene);
    else this.object = new Unit(scene);

    this.isSelected = false;
}

Piece.prototype = Object.create(CGFobject.prototype);
Piece.prototype.constructor = Piece;

/**
 * Displays a piece
 */
Piece.prototype.display = function () {
    this.scene.pushMatrix();
    if(this.isSelected)
        this.scene.setActiveShader(this.scene.nodes.selectedShader);
    if(this.animation != null){
        this.scene.multMatrix(this.animation.getMatrix(this.timer));
    }
    this.object.display();
    if(this.isSelected)
        this.scene.setActiveShader(this.scene.defaultShader);
    this.scene.popMatrix();
}

/**
 * Sets piece actual tile
 * @param tile
 */
Piece.prototype.setTile = function (tile) {
    this.tile = tile;
}

/**
 * Returns actual tile
 * @returns {null|*}
 */
Piece.prototype.getTile = function () {
    return this.tile;
}

/**
 * Returns piece colour, blue or red
 * @returns {*}
 */
Piece.prototype.getColour = function () {
    return this.colour;
}

/**
 * Returns piece type, Node or Unit
 * @returns {*}
 */
Piece.prototype.getType = function () {
    return this.type;
}

/**
 * Returns piece name used in the board
 * @returns {*}
 */
Piece.prototype.getUnit = function () {
    return this.unit;
}

/**
 * Sets the selected value
 */
Piece.prototype.setSelected = function (value) {
    this.isSelected=value;
}

/**
 * Sets piece animation
 * @param animation
 */
Piece.prototype.setAnimation = function(animation) {
    this.animation = animation;
    if (animation==null)
        this.timer=null;
}