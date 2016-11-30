/**
 * HexBoard
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function HexBoard(scene) {
	CGFobject.call(this,scene);

    colourS = vec4.create();
    vec4.set(colourS, 1, 0, 0, 1);

    du=10;
    dv=10;

    su=-1;
    sv=-1;

    this.board = new Plane(this.scene, du, dv, 31, 31);
    this.boardShader = new CGFshader(this.scene.gl, "shaders/nodesboard.vert", "shaders/nodesboard.frag");
    this.boardShader.setUniformsValues({
        uSampler2: 1,
        cs: colourS,
        du: du,
        dv: dv,
        su: su,
        sv: sv
    });

}

HexBoard.prototype = Object.create(CGFobject.prototype);
HexBoard.prototype.constructor=HexBoard;

HexBoard.prototype.display = function () {
    this.scene.setActiveShader(this.boardShader);
    this.board.display();
    this.scene.setActiveShader(this.scene.defaultShader);
}

HexBoard.prototype.updateTexCoords = function (length_s, length_t) {
}

