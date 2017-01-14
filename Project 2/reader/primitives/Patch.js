function Patch(scene, orderU, orderV, partsU, partsV, controlPoints) {
    CGFobject.call(this,scene);

    this.orderU = orderU;
    this.orderV = orderV;
    this.partsU = partsU;
    this.partsV = partsV
    this.controlPoints = controlPoints;
    this.controlVertexs = [];

    this.initBuffers();
};

Patch.prototype = Object.create(CGFobject.prototype);
Patch.prototype.constructor = Patch;

Patch.prototype.initBuffers = function() {
    counter = 0;
    for (var i = 0; i <= this.orderU; i++) {
        var controlVertex = [];
        for (var j = 0; j <= this.orderV; j++) {
            controlVertex.push(this.controlPoints[counter]);
            counter++;
        }
        this.controlVertexs.push(controlVertex);
    }
    this.makeSurface(this.orderU, this.orderV, this.controlVertexs);
};

Patch.prototype.getKnotsVector = function(degree) {

    /*var v = new Array();
     var points = (degree + 1)*2;
     // The knot vector is a sequence of parameter values that determines where and how the control points affect the NURBS curve.
     // The number of knots is always equal to the number of control points plus curve degree plus one
     // (i.e. number of control points plus curve order). If u degree is 2 and v degree is 3, the number of knots is 14 -> (degree + 1)*2;
     for (var i=0; i<points; i++) {
     v.push(0);
     }
     return v;*/

    var v = new Array();
    for (var i = 0; i <= degree; i++) {
        v.push(0);
    }
    for (var i = 0; i <= degree; i++) {
        v.push(1);
    }
    return v;
}

Patch.prototype.makeSurface = function (degree1, degree2, controlvertexes) {

    var knots1 = this.getKnotsVector(degree1);
    var knots2 = this.getKnotsVector(degree2);

    var nurbsSurface = new CGFnurbsSurface(degree1, degree2, knots1, knots2, controlvertexes);
    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    this.patch = new CGFnurbsObject(this.scene, getSurfacePoint, this.partsU, this.partsV);
}

Patch.prototype.display = function () {
    this.patch.display();
}

Patch.prototype.updateTexCoords = function (length_s, length_t){}
