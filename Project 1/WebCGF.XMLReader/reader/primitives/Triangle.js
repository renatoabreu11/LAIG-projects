/**
 * Triangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Triangle(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
	CGFobject.call(this,scene);

	this.x1=x1;
	this.y1=y1;
	this.z1=z1;
	this.x2=x2;
	this.y2=y2;
	this.z2=z2;
	this.x3=x3;
	this.y3=y3;
	this.z3=z3;

	this.b = Math.sqrt( Math.pow((this.x2 - this.x1), 2) +
						Math.pow((this.y2 - this.y1), 2) +
						Math.pow((this.z2 - this.z1), 2))

	this.a = Math.sqrt( Math.pow((this.x1 - this.x3), 2) +
						Math.pow((this.y1 - this.y3), 2) +
						Math.pow((this.z3 - this.z3), 2))

	this.c = Math.sqrt( Math.pow((this.x3 - this.x2), 2) +
						Math.pow((this.y3 - this.y2), 2) +
						Math.pow((this.z3 - this.z2), 2))

	this.alpha = Math.acos((-(Math.pow(this.a), 2)
							+(Math.pow(this.b), 2)
							+(Math.pow(this.c), 2)) / (2*this.b*this.c));

	this.beta = Math.acos(((Math.pow(this.a), 2)
							-(Math.pow(this.b), 2)
							+(Math.pow(this.c), 2)) / (2*this.a*this.c));

	this.gamma = Math.acos(((Math.pow(this.a), 2)
							+(Math.pow(this.b), 2)
							-(Math.pow(this.c), 2)) / (2*this.a*this.b));

	this.initBuffers();
}

Triangle.prototype = Object.create(CGFobject.prototype);
Triangle.prototype.constructor=Triangle;

Triangle.prototype.initBuffers = function () {
	this.vertices = [
		this.x1, this.y1, this.z1,
		this.x2, this.y2, this.z2,
		this.x3, this.y3, this.z3
    ];

	this.indices = [
		0, 1, 2,
		0, 2, 1,
    ];

	this.primitiveType=this.scene.gl.TRIANGLES;		//só se desenha triangulos

	this.normals =[
		0, 1, 0,
		0, 1, 0,
		0, 1, 0
	];

	this.texCoords = [
        (this.c - this.a * Math.cos(this.b)), this.a * Math.sin(this.b),
        0, 0,
        this.c, 0
    ];

	this.initGLBuffers();		//desenha no ecrã este objecto, a informação é passada para o WebGL.
};