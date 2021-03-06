/**
 * Quad
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Rectangle(scene, x1, y1, x2, y2) {
	CGFobject.call(this,scene);

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

	this.initBuffers();
}

Rectangle.prototype = Object.create(CGFobject.prototype);
Rectangle.prototype.constructor=Rectangle;

Rectangle.prototype.initBuffers = function () {
	this.vertices = [
		this.x1, this.y1, 0,
		this.x2, this.y1, 0,
		this.x1, this.y2, 0,
		this.x2, this.y2, 0,
        ];

	this.indices = [
		0, 1, 2,
		1, 3, 2,
        ];  //estes sao os vectices criados. Desenha se 2 triangulos, um com vertices 0, 1, 2 e mais um, fazendo um quadrado
			//a ordem dos vertices indica para onde esta virada a face.

	this.primitiveType=this.scene.gl.TRIANGLES;		//só se desenha triangulos

	this.normals =
	[
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, 0, 1
	];

	var xTex=(this.x2-this.x1),yTex=(this.y2-this.y1);
    this.texCoords = [
        0,0,
        xTex,0,
        0,yTex,
        xTex,yTex
    ];

	this.initGLBuffers();		//desenha no ecrã este objecto, a informação é passada para o WebGL.
};

Rectangle.prototype.updateTexCoords = function (length_s, length_t){
	var xTex=(this.x2-this.x1)/length_s;
	var yTex=(this.y2-this.y1)/length_t;
    this.texCoords = [
        0,0,
        xTex,0,
        0,yTex,
        xTex,yTex
    ];

    this.updateTexCoordsGLBuffers();
}
