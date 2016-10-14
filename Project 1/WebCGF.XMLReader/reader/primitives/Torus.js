/**
 * Torus
 * @constructor
 */
 function Torus(scene, inner, outer, slices, loops) {
 	CGFobject.call(this,scene);
	
	this.slices = slices;
	this.loops = loops;
	this.innerRadius = inner;
    this.outerRadius = outer;

 	this.initBuffers();
 };

Torus.prototype = Object.create(CGFobject.prototype);
Torus.prototype.constructor = Torus;

Torus.prototype.initBuffers = function() {
    this.vertices = [];
    this.normals = [];
    this.texCoords = [];
    this.indices = [];

    for (var latNumber = 0; latNumber <= this.loops; latNumber++){ 
        var theta = latNumber * 2 * Math.PI / this.loops
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber <= this.slices; longNumber++) {
            var phi = longNumber * 2 * Math.PI / this.slices;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            //Equation used for torus
            var x = (this.outerRadius + this.innerRadius*cosTheta)*cosPhi;
            var y = (this.outerRadius + this.innerRadius*cosTheta)*sinPhi;
            var z = this.innerRadius * sinTheta;

            var u = 1 - (longNumber / this.slices);
            var v = 1 - (latNumber / this.loops);

            this.normals.push(x, y, z);
            this.texCoords.push(u, v);
            this.vertices.push(x, y, z);
        }
    }

    for (var latNumber = 0; latNumber < this.loops; latNumber++) {
        for (var longNumber = 0; longNumber < this.slices; longNumber++) {
            var first = (latNumber * (this.slices + 1)) + longNumber;
            var second = first + this.slices + 1;
            this.indices.push(first);
            this.indices.push(second + 1);
            this.indices.push(second);
            this.indices.push(first);
            this.indices.push(first + 1);
            this.indices.push(second + 1);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};