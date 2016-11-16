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
    this.colour1 = vec4.create();
    vec4.set(this.colour1, c1.r, c1.g, c1.b, c1.a);
    this.colour2 = vec4.create();
    vec4.set(this.colour2, c2.r, c2.g, c2.b, c2.a);
    this.colourS = vec4.create();
    vec4.set(this.colourS, cs.r, cs.g, cs.b, cs.a);
    this.board = new Plane(this.scene, 1, 1, this.du, this.dv);

    this.appearance = new CGFappearance(this.scene);
    this.appearance.setTexture(this.textureref['info']);
    this.appearance.setTextureWrap('REPEAT', 'REPEAT');

    this.boardShader = new CGFshader(this.scene.gl, "shaders/chessboard.vert", "shaders/chessboard.frag");
    this.boardShader.setUniformsValues({
        uSampler2: 1,
        c1: this.colour1,
        c2: this.colour2,
        cs: this.colourS,
        du: this.du,
        dv: this.dv,
        su: this.su,
        sv: this.sv
    });
}

Chessboard.prototype = Object.create(CGFobject.prototype);
Chessboard.prototype.constructor=Chessboard;

Chessboard.prototype.display = function () {
    this.appearance.apply();
    this.scene.setActiveShader(this.boardShader);
    this.board.display();
    this.scene.setActiveShader(this.scene.defaultShader);
}

Chessboard.prototype.updateTexCoords = function (length_s, length_t) {
}
