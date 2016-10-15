
function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

	this.axis=new CGFaxis(this);
	this.lightStatus = [];
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

XMLscene.prototype.setInterface = function(myInterface){
	this.interface = myInterface;
}

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
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
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.updateCamera = function () {
	this.graph.setNextView();
	this.camera = this.graph.getDefaultView();
}

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
			this.lights[i].setSpotDirection(light["target"]["x"], light["target"]["y"], light["target"]["z"]);
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
		this.interface.addLight(i, light["id"])
		i++;
	}
};

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

/*
XMLscene.prototype.applyTransformationToComponent = function (transf, compID) {

	//check if comp exists
	var comp=null, index=null;

	for (var i in this.graph.components) {
		console.log(this.graph.components[i].id);
			if(this.graph.components[i].id==compID){
				comp=this.graph.components[i];
				index=i;
				break;
			}
		}
	if(comp==null) {
		console.log("Error: component not found to apply transformation");
		return;
	}

	comp.isChecked=true;

	//calculate new matrix
	this.setMatrix(comp.transformation);
	console.log(this.getMatrix());
	this.multMatrix(transf);
	console.log(this.getMatrix());
	comp.finalTransformation=this.getMatrix();
	this.loadIdentity();
	//update component in this.graph.components
	this.graph.components[index]=comp;

	//apply transf to chidren
	for(var i in comp.children['components']) {
		var childID = comp.children['components'][i].id;
		applyTransformationToComponent(comp.finalTransformation,childID);
	}
}

XMLscene.prototype.loadTransformations = function() {
	 var components = this.graph.components;

	 for(var fatherCompIndex in components) { //iterate components
	 	var fatherComp = components[fatherCompIndex];
	 	if(fatherComp.isChecked)
	 		continue;

	 	var transf = fatherComp.transformation;
	 	for(var childCompIndex in fatherComp.children["components"]) { //iterate child-components
	 		var childComp = fatherComp.children["components"][childCompIndex];

	 		var matrixBackup=this.getMatrix();
	 		this.loadIdentity();
	 		//apply transformation to comp and its children
	 		this.applyTransformationToComponent(transf,childComp.getID());
	 		this.setMatrix(matrixBackup);
	 	}
	 }

	 for(var compIndex in components) { //iterate components
	 	var comp = components[compIndex];
	 	var transf = comp.finalTransformation;
	 	for(var primIndex in comp.children["primitives"]) { //iterate primitives
	 		var primID = comp.children["primitives"][primIndex]['id'];
	 		var size = this.primitives[primID]['transformations'].length;
	 		this.primitives[primID]['transformations'][size]=transf;
	 	}
	 }
}*/

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
		//this.updateLights();
		for(var comp of this.graph.components){
    		comp.display();
    	}
	}
};

