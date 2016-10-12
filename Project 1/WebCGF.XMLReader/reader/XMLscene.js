
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
};

XMLscene.prototype.initLights = function () {
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () 
{
	this.gl.clearColor(this.graph.illumination["background"]["r"],this.graph.illumination["background"]["g"],
						this.graph.illumination["background"]["b"],this.graph.illumination["background"]["a"]);
	
	this.setAmbient(this.graph.illumination["ambient"]["r"],this.graph.illumination["ambient"]["g"],
						this.graph.illumination["ambient"]["b"],this.graph.illumination["ambient"]["a"]);

	//last value is thickness
    this.axis= new CGFaxis(this, this.graph.axisLength, 0.05);

    //this.camera = this.graph.getDefaultView();
    this.graph.loadLights();
    this.primitives=[];
	this.loadPrimitives();
};

XMLscene.prototype.loadPrimitives = function(){
	for(var primitive in this.graph.primitives){
		var prim = this.graph.primitives[primitive];
		var index = this.primitives.length;
		switch(prim['tag']){
			case 'rectangle':
				var values = prim['rectangle'];
				this.primitives[index] = new MyQuad(this,values['x1'],values['y1'],values['x2'],values['y2']);
				break;
			case 'triangle':
				var values = prim['triangle'];
				this.primitives[index] = new MyTriangle(this,values['x1'],values['y1'],values['x2'],values['y2']);
				break;;
			default:
				console.log(prim['tag']);
				break;
		}
	}
}

XMLscene.prototype.nextView = function(){
	this.graph.setNextView();
	this.camera = this.graph.getDefaultView();
}

XMLscene.prototype.setInterface = function(myInterface){
	this.interface = myInterface;
}

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
	if (this.graph.loadedOk)
	{
		for(var i = 0; i < this.lights.length; i++){
				this.lights[i].update();
		}

		for(var prim in this.primitives){
			this.primitives[prim].display();
		}
	};	
};

