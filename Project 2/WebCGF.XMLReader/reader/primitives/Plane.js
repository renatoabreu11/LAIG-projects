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
    var control1 = [[-xCoord, -Ycoord, 0, 1], [-xCoord, yCoord, 0, 1]];
    var control2 = [[xCoord, -Ycoord, 0, 1], [xCoord, yCoord, 0, 1]];
    this.controlVertex.push(control1);
    this.controlVertex.push(control2);
    this.makeSurface(1, 1, this.controlVertex);
};

Plane.prototype.getKnotsVector = function(degree) {

    var v = new Array();
    for (var i=0; i<=degree; i++) {
        v.push(0);
    }
    for (var i=0; i<=degree; i++) {
        v.push(1);
    }
    return v;
}

Plane.prototype.makeSurface = function (degree1, degree2, controlvertexes) {

    var knots1 = this.getKnotsVector(degree1);
    var knots2 = this.getKnotsVector(degree2);


    var nurbsSurface = new CGFnurbsSurface(degree1, degree2, knots1, knots2, controlvertexes);
    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    this.plane = new CGFnurbsObject(this, getSurfacePoint, this.partsX, this.partsY);
}

Plane.prototype.display = function () {
    this.plane.display();
}

Plane.prototype.updateTexCoords = function (length_s, length_t){}
