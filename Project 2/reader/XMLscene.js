/**
 * XMLscene constructor
 */
function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * Init Xml scene variables
 * @param  {[CGFapplication]} scene application
 */
XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
	this.gl.depthFunc(this.gl.LEQUAL);
	this.gl.enable(this.gl.BLEND);
	this.gl.blendEquation(this.gl.FUNC_ADD);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	this.gl.depthFunc(this.gl.LEQUAL);
	this.gl.depthMask(true);

    this.enableTextures(true);

	this.axis=new CGFaxis(this);
	this.lightStatus = [];
	
    this.updatePeriod = 1 / 60 * 1000;	// update period in ms (1/60 * 1000 ms = 60 Hz)
    this.setUpdatePeriod(this.updatePeriod);
    this.initialTime = 0;
    this.elapsedTime = 0;
};

/**
 * Sets scene appearance to default
 */
XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

/**
 * Sets scene interface
 * @param {[MyInterface]} myInterface
 */
XMLscene.prototype.setInterface = function(myInterface){
	this.interface = myInterface;
}

/**
 * Handler called when the graph is finally loaded. 
 * As loading is asynchronous, this may be called already after the application has started the run loop
 */
XMLscene.prototype.onGraphLoaded = function () 
{
	this.gl.clearColor(this.graph.illumination["background"]["r"],this.graph.illumination["background"]["g"],
						this.graph.illumination["background"]["b"],this.graph.illumination["background"]["a"]);
	
	this.setAmbient(this.graph.illumination["ambient"]["r"],this.graph.illumination["ambient"]["g"],
						this.graph.illumination["ambient"]["b"],this.graph.illumination["ambient"]["a"]);

    this.axis = new CGFaxis(this, this.graph.axisLength, 0.05);
    this.camera = this.graph.getDefaultView();
    this.interface.setActiveCamera(this.camera);
    this.initLights();
    this.materialDefault = new CGFappearance(this);
};

/**
 * Initializes default camera
 */
XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

/**
 * Sets camera to the next view
 */
XMLscene.prototype.updateCamera = function () {
	this.graph.setNextView();
	this.camera = this.graph.getDefaultView();
}

/**
 * Initializes lights
 */
XMLscene.prototype.initLights = function () {
	var i = 0;
	for(var light of this.graph.lights){
		this.lights[i].setPosition(light["location"]["x"], light["location"]["y"], light["location"]["z"], light["location"]["w"]);
		this.lights[i].setDiffuse(light["diffuse"]["r"], light["diffuse"]["g"], light["diffuse"]["b"], light["diffuse"]["a"]);
		this.lights[i].setAmbient(light["ambient"]["r"], light["ambient"]["g"], light["ambient"]["b"], light["ambient"]["a"]);
		this.lights[i].setSpecular(light["specular"]["r"], light["specular"]["g"], light["specular"]["b"], light["specular"]["a"]);

		if(light["type"] == "spot"){
			this.lights[i].setSpotCutOff(light["angle"]);
			this.lights[i].setSpotExponent(light["exponent"]);
			var target = [];
			target["x"] = light["target"]["x"] - light["location"]["x"];
			target["y"] = light["target"]["y"] - light["location"]["y"];
			target["z"] = light["target"]["z"] - light["location"]["z"];
			this.lights[i].setSpotDirection(target["x"], target["y"], target["z"]);
		}

		if(light["enabled"]){
			this.lights[i].enable();
			this.lights[i].setVisible(true);
			this.lightStatus[i] = true;
		}else{
			this.lights[i].enable();
			this.lightStatus[i] = false;
		}
		this.lights[i].update();
		this.interface.addLight(i, light["id"]);
		i++;
	}
};

/**
 * Updates lights accordingly to the user input on the interface
 */
XMLscene.prototype.updateLights = function () {
	var i = 0;
	for (i; i < this.lights.length; i++){
		this.lights[i].update();
	}

	for(var j = 0; j < this.lightStatus.length; j++){
		if(this.lightStatus[j]){
			this.lights[j].enable();
			this.lights[j].setVisible(true);
		}else{
			this.lights[j].disable();
			this.lights[j].setVisible(false);
		}
	}
}

/**
 * Changes all the components default material
 */
XMLscene.prototype.updateMaterials = function () {
	for(var component of this.graph.components){
		component.nextMaterial();
	}
}

XMLscene.prototype.update = function(currTime){
    if(this.initialTime == 0)
        this.initialTime = currTime;

    this.elapsedTime = (currTime - this.initialTime)/1000;
}

/**
 * Loop which display the objects that belong to the scene
 */
XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
	
	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();

	this.setDefaultAppearance();
	
	// ---- END Background, camera and axis setup
	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
    if (this.graph.loadedOk){
		this.updateLights();
		this.materialDefault.apply();
		this.graph.getRootComponent().display(null, null, this.elapsedTime);
     }
};

