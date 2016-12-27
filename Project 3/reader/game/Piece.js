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
    this.texture = new CGFappearance(this.scene);
    this.texture.loadTexture('../res/'+(this.colour=="blue"?'blue':'red')+'.jpg');
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

Piece.prototype.getColour = function () {
    return this.colour;
}

Piece.prototype.getType = function () {
    return this.type;
}

Piece.prototype.display = function () {
    this.scene.pushMatrix();
    if(this.isSelected)
        this.selected.apply();
    else this.texture.apply();
    if(this.animation != null){
        this.scene.multMatrix(this.animation.getMatrix(this.timer));
    }
    this.object.display();
    this.scene.popMatrix();
}

Piece.prototype.select = function () {
    this.isSelected=true;
}

Piece.prototype.deselect = function () {
    this.isSelected=false;
}

Piece.prototype.setAnimation = function(animation) {
    this.animation = animation;
    if (animation==null)
        this.timer=null;
}