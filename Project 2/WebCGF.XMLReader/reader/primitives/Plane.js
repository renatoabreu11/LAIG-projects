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

    for(u=0; u<=this.dimX; u++){
        
        var x = u/this.dimX;
        for(v=0; v<=this.dimY; v++){
            
            var y = v/this.dimY;
            this.controlVertexes.push([x,y,0,1]);
        }
    }

    this.plane = new Patch(this.scene, this.dimX, this.dimY, this.partsX, this.partsY, this.controlVertexes);
};

Plane.prototype.display = function () {
    this.plane.display();
}

Plane.prototype.updateTexCoords = function (length_s, length_t){}
