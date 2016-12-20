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

    this.nrPieces = 18;

    this.cells = [];
    for(var i = 0; i < 69; i++){
        this.cells.push(new Circle(this.scene, 0.4, 12));
    }
}

HexBoard.prototype = Object.create(CGFobject.prototype);
HexBoard.prototype.constructor=HexBoard;

HexBoard.prototype.display = function () {
    this.scene.pushMatrix();
    this.scene.setActiveShader(this.boardShader);
    this.scene.scale(1.03, 1.03, 1.03);
    this.scene.rotate(-90*Math.PI/180, 0, 1, 0);
    this.scene.rotate(-90*Math.PI/180, 1, 0, 0);
    this.board.display();
    this.scene.setActiveShader(this.scene.defaultShader);
    this.scene.popMatrix();

    var coordX = -4;
    var coordZ = -4;
    var inc = 1;
    var nrPieces = 9;
    var cellIndex = 0;
    for(var j = 0; j <= 8; j++) {
        this.scene.pushMatrix()
        this.scene.translate(0, 0, coordZ);
        if(Math.abs(coordZ) == 4){
            coordX = -2;
            nrPieces = 5;
        }else if(Math.abs(coordZ) == 3){
            coordX = -3;
            nrPieces = 7;
        }else nrPieces = 9;
        for (var i = 0; i < nrPieces; i++) {
            this.scene.pushMatrix();
            this.scene.translate(coordX, 0.03, 0);
            this.scene.rotate(-90 * Math.PI / 180, 0, 1, 0);
            this.scene.rotate(-90 * Math.PI / 180, 1, 0, 0);
            this.scene.registerForPick(this.scene.pickObjectID, this.cells[cellIndex]);
            this.scene.pickObjectID++;
            this.cells[cellIndex].display();
            cellIndex++;
            this.scene.popMatrix()
            coordX += inc;
        }
        this.scene.popMatrix()
        coordX = -4;
        coordZ += inc;
    }
}

HexBoard.prototype.registerCellsForPick = function () {
    for(var i = 0; i < 69; i++){
        this.scene.registerForPick(this.scene.pickObjectID, this.cells[i]);
        this.scene.pickObjectID++;
    }
}

HexBoard.prototype.updateTexCoords = function (length_s, length_t) {
}

