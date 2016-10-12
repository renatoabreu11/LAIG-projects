/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyTriangle(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
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

	this.initBuffers();
}

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor=MyTriangle;

MyTriangle.prototype.initBuffers = function () {
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

	this.normals =
	[
		0, 1, 0,
		0, 1, 0,
		0, 1, 0
	];
	
	this.initGLBuffers();		//desenha no ecrã este objecto, a informação é passada para o WebGL.
};
