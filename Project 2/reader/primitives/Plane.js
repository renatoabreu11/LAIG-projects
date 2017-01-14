/** Represents a plane with nrDivs divisions along both axis, with center at (0,0) */
function Plane(scene, dimX, dimY, partsX, partsY) {
    CGFobject.call(this,scene);

    this.dimX = dimX;
    this.dimY = dimY;
    this.partsX = partsX;
    this.partsY = partsY;

    this.initBuffers();
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.initBuffers = function() {

    this.controlVertexes = [];

    var yCoord = this.dimY / 2;
    var xCoord = this.dimX / 2;
    var point1 = [-xCoord, -yCoord, 0, 1];
    var point2 = [-xCoord, yCoord, 0, 1];
    var point3 = [xCoord, -yCoord, 0, 1];
    var point4 = [xCoord, yCoord, 0, 1];
    this.controlVertexes.push(point1);
    this.controlVertexes.push(point2);
    this.controlVertexes.push(point3);
    this.controlVertexes.push(point4);
    this.plane = new Patch(this.scene, 1, 1, this.partsX, this.partsY, this.controlVertexes);
};

Plane.prototype.display = function () {
    this.plane.display();
}

Plane.prototype.updateTexCoords = function (length_s, length_t){}
