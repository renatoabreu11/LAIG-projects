/**
 * Chessboard
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Chessboard(scene, du, dv, textureref, su, sv, c1, c2, cs) {
	CGFobject.call(this,scene);

    this.du = du;
    this.dv = dv;

    this.su = su;
    this.sv = sv;
    this.textureref = textureref;
    this.c1 = c1;
    this.c2 = c2;
    this.cs = cs;
    this.board = new Plane(this.scene, this.du, this.dv, 8, 8);
    this.scene.boardShader = new CGFshader(this.scene.gl,"shaders/chessboard.vert", "shaders/chessboard.frag");

}

Chessboard.prototype = Object.create(CGFobject.prototype);
Chessboard.prototype.constructor=Chessboard;

Chessboard.prototype.display = function () {
    //this.scene.setActiveShader(this.scene.boardShader);
    this.board.display();
    //this.scene.setActiveShader(this.scene.defaultShader);
}


Chessboard.prototype.updateTexCoords = function (length_s, length_t){
    //this.updateTexCoordsGLBuffers();
}
