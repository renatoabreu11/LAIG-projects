function Portal(scene) {
    CGFobject.call(this, scene);

    this.appearance = new CGFappearance(this.scene);
    this.appearance.loadTexture("../res/portal.png");
    this.portalShader = new CGFshader(this.scene.gl, "shaders/portal.vert", "shaders/portal.frag");
    this.portalShader.setUniformsValues({
        uSampler2: 1,
    });

    this.controlVertexes = [
        [-0.941, -0.942, -0.275, 1],
        [-1.457, -0.468, -0.425, 1],
        [-1.457, 0.420, -0.416, 1],
        [-0.966, 0.755, -0.292, 1],

        [-0.515, -1.333, -0.098, 1],
        [-0.474, -0.498, 0.326, 1],
        [-0.524, 0.386, 0.248, 1],
        [-0.549, 1.196, -0.107, 1],

        [0.554, -1.352, -0.145, 1],
        [0.557, -0.622, 0.308, 1],
        [0.568, 0.381, 0.290, 1],
        [0.489, 1.266, -0.075, 1],

        [1.112, -1.026, -0.404, 1],
        [1.905, -0.525, -0.549, 1],
        [1.906, 0.425, -0.547, 1],
        [1.004, 0.945, -0.281, 1]
    ];

    console.log(this.controlVertexes)

    this.portal = new Patch(this.scene, 3, 3, 8, 8, this.controlVertexes);
}

Portal.prototype = Object.create(CGFobject.prototype);
Portal.prototype.constructor = Portal;

Portal.prototype.display = function () {
    this.scene.pushMatrix();
    this.appearance.apply();
    this.scene.rotate(-90 * Math.PI / 180, 1, 0, 0);
    this.scene.scale(10, 10, 1);
    this.scene.rotate(90 * Math.PI / 180, 0, 0, 1);
    this.scene.setActiveShader(this.portalShader);
    this.portal.display();
    this.scene.setActiveShader(this.scene.defaultShader)
    this.scene.popMatrix();
}

Portal.prototype.updateTexCoords = function (length_s, length_t) {
}

