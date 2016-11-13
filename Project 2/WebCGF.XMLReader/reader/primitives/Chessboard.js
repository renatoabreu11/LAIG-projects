/**
 * Chessboard
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Chessboard(scene, du, dv, textureref, su, sv, c1, c2, cs) {
	CGFobject.call(this,scene);

    this.du = du;
    this.dv = dv;
    orderU, orderV, partsU, partsV, controlPoints
    this.board = new Patch(1, 1, this.du, this.dv)

    this.su = su;
    this.sv = sv;
    this.textureref = textureref;
    this.c1 = c1;
    this.c2 = c2;
    this.cs = cs;

	this.initBuffers();
}

Chessboard.prototype = Object.create(CGFobject.prototype);
Chessboard.prototype.constructor=Chessboard;

Chessboard.prototype.initBuffers =function (){
	this.initGLBuffers();
};

Chessboard.prototype.updateTexCoords = function (length_s, length_t){
    this.updateTexCoordsGLBuffers();
}
