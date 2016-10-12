/**
 * MyQuad
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

/*function MyQuad(scene, minS=0, maxS=1, minT=0, maxT=1) {
	CGFobject.call(this,scene);

    this.minS = minS;
    this.maxS = maxS;
    this.minT = minT;
    this.maxT = maxT;

	this.initBuffers();
}*/

function MyQuad(scene, x1, y1, x2, y2) {
	CGFobject.call(this,scene);

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

	this.initBuffers();
}

MyQuad.prototype = Object.create(CGFobject.prototype);
MyQuad.prototype.constructor=MyQuad;

MyQuad.prototype.initBuffers = function () {
	this.vertices = [
		this.x1, this.y1, 0,
		this.x2, this.y1, 0,
		this.x1, this.y2, 0,
		this.x2, this.y2, 0,
        ];

	this.indices = [
		0, 1, 2,
		0, 2, 1,
		1, 2, 3,
		1, 3, 2
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

/*    this.texCoords = [
        this.maxS, this.minT,
        this.minS, this.minT,
        this.minS, this.maxT,
        this.maxS, this.maxT
    ];
*/
	this.initGLBuffers();		//desenha no ecrã este objecto, a informação é passada para o WebGL.
};
