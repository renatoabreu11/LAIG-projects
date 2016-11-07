function Patch(scene, orderU, orderV, partsU, partsV) {
    CGFobject.call(this,scene);

    this.orderU = orderU;
    this.orderV = orderV;
    this.partsU = partsU;
    this.partsV = partsV
    this.controlPoints = [];
    this.controlVertexs = [];

    this.initBuffers();
};

Patch.prototype = Object.create(CGFobject.prototype);
Patch.prototype.constructor = Patch;

Patch.prototype.addControlPoint = function (x, y, z) {
    var control = [x, y, z];
    this.controlPoints.push(control);
}

Patch.prototype.initBuffers = function() {
    counter = 0;
    for(var i = 0; i <= this.orderV; i++){
        var controlVertex = [];
        for(var j = 0; j <= this.orderU; j++){
            controlVertex.push(controlPoints[counter]);
            counter++;
        }
        this.controlVertexs.push(controlVertex);
    }

    this.makeSurface(orderU, orderV, this.controlVertexs);
};

Patch.prototype.getKnotsVector = function(degree) {

    var v = new Array();
    var points = (degree + 1)*2;
    // The knot vector is a sequence of parameter values that determines where and how the control points affect the NURBS curve.
    // The number of knots is always equal to the number of control points plus curve degree plus one
    // (i.e. number of control points plus curve order). If u degree is 2 and v degree is 3, the number of knots is 14 -> (degree + 1)*2;
    for (var i=0; i<points; i++) {
        v.push(0);
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

    this.patch = new CGFnurbsObject(this, getSurfacePoint, this.partsX, this.partsY);
}

Patch.prototype.display = function () {
    this.patch.display();
}

Patch.prototype.updateTexCoords = function (length_s, length_t){}
