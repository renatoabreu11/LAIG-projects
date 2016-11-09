/** Represents a plane with nrDivs divisions along both axis, with center at (0,0) */
function Plane(scene, dimX, dimY, partsX, partsY) {
    CGFobject.call(this,scene);

    this.dimX = dimX;
    this.dimY = dimY;
    this.partsX = partsX;
    this.partsY = partsX

    this.initBuffers();
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.initBuffers = function() {

    this.controlVertex = [];

    var yCoord = this.dimY / 2;
    var xCoord = this.dimX / 2;
    var point1 = [-xCoord, -yCoord, 0, 1];
    var point2 = [-xCoord, yCoord, 0, 1];
    var point3 = [xCoord, -yCoord, 0, 1];
    var point4 = [xCoord, yCoord, 0, 1];
    this.controlVertex.push(point1);
    this.controlVertex.push(point2);
    this.controlVertex.push(point3);
    this.controlVertex.push(point4);
    this.plane = new Patch(this.scene, 1, 1, this.partsX, this.partsY, this.controlVertex);
};

Plane.prototype.display = function () {
    this.plane.display();
}

Plane.prototype.updateTexCoords = function (length_s, length_t){}
