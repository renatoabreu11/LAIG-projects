
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseLights(rootElement);
	//this.parseViews(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};



/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseGlobalsExample= function(rootElement) {
	
	var elems =  rootElement.getElementsByTagName('globals');
	if (elems == null) {
		return "globals element is missing.";
	}

	if (elems.length != 1) {
		return "either zero or more than one 'globals' element found.";
	}

	// various examples of different types of access
	var globals = elems[0];
	this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);

	console.log("Globals read from file: {background="+this.background+", drawmode="+this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");

	var tempList=rootElement.getElementsByTagName('list');

	if (tempList == null  || tempList.length==0) {
		return "list element is missing.";
	}
	
	this.list=[];
	// iterate over every element
	var nnodes=tempList[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=tempList[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;
		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	};

};

MySceneGraph.prototype.parseViews= function(rootElement) {
	
	//VIEWS
	var elemsViews =  rootElement.getElementsByTagName('views');
	if (elemsViews == null) {
		return "views element is missing.";
	}

	if (elemsViews.length != 1) {
		return "either zero or more than one 'views' element found.";
	}

	var views = elemsViews[0];
	this.default = this.reader.getString(views, 'default');

	//VIEWS->PERSPECTIVE
	var elemsPersp = views.getElementsByTagName('perspective');
	if (elemsPersp.length < 1)
		return "no 'perpective' element found.";

	for(var i=0; i<elemsPersp.length; i++)
	{
		console.log("PERSPECTIVE "+i+":");
		var perspective = elemsPersp[i];
		var id = this.reader.getString(perspective, 'id');
		var near = this.reader.getFloat(perspective, 'near');
		var far = this.reader.getFloat(perspective, 'far');
		var angle = this.reader.getFloat(perspective, 'angle');
		console.log("id="+id+", near="+near+", far="+far+", angle="+angle);

		//VIEWS->PERSPECTIVE->FROM
		var elemsFrom = perspective.getElementsByTagName('from');
		if(elemsFrom == null)
			return "no 'from' element found in a 'perspective'";
		if(elemsFrom.length != 1)
			return "either zero or more than one 'from' element found in a 'perspective'.";
		var from = elemsFrom[0];
		var fromCoords = [];
		fromCoords[0] = this.reader.getFloat(from, 'x');
		fromCoords[1] = this.reader.getFloat(from, 'y');
		fromCoords[2] = this.reader.getFloat(from, 'z');
		console.log("from: ("+fromCoords[0]+","+fromCoords[1]+","+fromCoords[2]+")");
		
		//VIEWS->PERSPECTIVE->TO
		var elemsTo = perspective.getElementsByTagName('to');
		if(elemsTo == null)
			return "no 'to' element found in a 'perspective'";
		if(elemsFrom.length != 1)
			return "either zero or more than one 'to' element found in a 'perspective'."
		var to = elemsTo[0];
		var toCoords = [];
		toCoords[0] = this.reader.getFloat(to, 'x');
		toCoords[1] = this.reader.getFloat(to, 'y');
		toCoords[2] = this.reader.getFloat(to, 'z');
		console.log("to: ("+toCoords[0]+","+toCoords[1]+","+toCoords[2]+")");

	}

};

MySceneGraph.prototype.parseLights= function(rootElement) {
	
	//LIGHTS
	var elemsLights =  rootElement.getElementsByTagName('lights');
	if (elemsLights == null) {
		return "views element is missing.";
	}

	if (elemsLights.length != 1) {
		return "either zero or more than one 'views' element found.";
	}

	var lights = elemsLights[0];

	//LIGHTS->OMNI
	var elemsOmni = lights.getElementsByTagName('omni');
	if(elemsOmni == null)
		return "no 'omni' element found in 'light'";
	if(elemsOmni.length == 0)
		return "zero 'omni' elements found in 'light'.";
	for(var i=0; i<elemsOmni.length; i++)
	{
		var omni = elemsOmni[i];
		var id = this.reader.getString(omni, 'id');
		var enabled = this.reader.getBoolean(omni, 'enabled');
		console.log("id="+id+", enabled:"+enabled);

		//LIGHTS->OMNI->LOCATION
		var elemsLocation = omni.getElementsByTagName('location');
		if(elemsLocation == null)
			return "no 'location' element found in an 'omni'";
		if(elemsLocation.length != 1)
			return "either zero or more than one 'location' element found in a 'location'.";
		var location = elemsLocation[0];
		var locationCoords = [];
		locationCoords[0] = this.reader.getFloat(location, 'x');
		locationCoords[1] = this.reader.getFloat(location, 'y');
		locationCoords[2] = this.reader.getFloat(location, 'z');
		locationCoords[3] = this.reader.getFloat(location, 'w');
		console.log("location: "+locationCoords);

		//LIGHTS->OMNI->AMBIENT
		var elemsAmbient = omni.getElementsByTagName('ambient');
		if(elemsAmbient == null)
			return "no 'ambient' element found in an 'omni'";
		if(elemsAmbient.length != 1)
			return "either zero or more than one 'ambient' element found in a 'omni'.";
		var ambient = elemsAmbient[0];
		var ambientCoords = [];
		ambientCoords[0] = this.reader.getFloat(ambient, 'r');
		ambientCoords[1] = this.reader.getFloat(ambient, 'g');
		ambientCoords[2] = this.reader.getFloat(ambient, 'b');
		ambientCoords[3] = this.reader.getFloat(ambient, 'a');
		console.log("ambient: "+ambientCoords);

		//LIGHTS->OMNI->DIFFUSE
		var elemsDiffuse = omni.getElementsByTagName('diffuse');
		if(elemsDiffuse == null)
			return "no 'diffuse' element found in an 'omni'";
		if(elemsDiffuse.length != 1)
			return "either zero or more than one 'diffuse' element found in a 'omni'.";
		var diffuse = elemsDiffuse[0];
		var diffuseCoords = [];
		diffuseCoords[0] = this.reader.getFloat(diffuse, 'r');
		diffuseCoords[1] = this.reader.getFloat(diffuse, 'g');
		diffuseCoords[2] = this.reader.getFloat(diffuse, 'b');
		diffuseCoords[3] = this.reader.getFloat(diffuse, 'a');
		console.log("diffuse: "+diffuseCoords);

		//LIGHTS->OMNI->SPECULAR
		var elemsSpecular = omni.getElementsByTagName('specular');
		if(elemsSpecular == null)
			return "no 'specular' element found in an 'omni'";
		if(elemsSpecular.length != 1)
			return "either zero or more than one 'specular' element found in a 'omni'.";
		var specular = elemsSpecular[0];
		var specularCoords = [];
		specularCoords[0] = this.reader.getFloat(specular, 'r');
		specularCoords[1] = this.reader.getFloat(specular, 'g');
		specularCoords[2] = this.reader.getFloat(specular, 'b');
		specularCoords[3] = this.reader.getFloat(specular, 'a');
		console.log("specular: "+specularCoords);

	}

	//LIGHTS->SPOT
	var elemsSpot = lights.getElementsByTagName('spot');
	if(elemsSpot == null)
		return "no 'spot' element found in 'light'";
	if(elemsSpot.length == 0)
		return "zero 'spot' elements found in 'light'.";
	for(var i=0; i<elemsSpot.length; i++)
	{
		var spot = elemsSpot[i];
		var id = this.reader.getString(spot, 'id');
		var enabled = this.reader.getBoolean(spot, 'enabled');
		var angle = this.reader.getFloat(spot, 'angle');
		var exponent = this.reader.getFloat(spot, 'exponent');
		console.log("id="+id+", enabled:"+enabled+", angle="+angle+", exponent="+exponent);

		//LIGHTS->SPOT->TARGET
		var elemtsTarget = spot.getElementsByTagName('target');
		if(elemtsTarget == null)
			return "no 'target' element found in an 'spot'";
		if(elemtsTarget.length != 1)
			return "either zero or more than one 'target' element found in a 'spot'.";
		var target = elemtsTarget[0];
		var targetCoords = [];
		targetCoords[0] = this.reader.getFloat(target, 'x');
		targetCoords[1] = this.reader.getFloat(target, 'y');
		targetCoords[2] = this.reader.getFloat(target, 'z');
		console.log("target: "+targetCoords);

		//LIGHTS->SPOT->LOCATION
		var elemsLocation = spot.getElementsByTagName('location');
		if(elemsLocation == null)
			return "no 'location' element found in an 'spot'";
		if(elemsLocation.length != 1)
			return "either zero or more than one 'location' element found in a 'spot'.";
		var location = elemsLocation[0];
		var locationCoords = [];
		locationCoords[0] = this.reader.getFloat(location, 'x');
		locationCoords[1] = this.reader.getFloat(location, 'y');
		locationCoords[2] = this.reader.getFloat(location, 'z');
		console.log("location: "+locationCoords);

		//LIGHTS->SPOT->AMBIENT
		var elemsAmbient = spot.getElementsByTagName('ambient');
		if(elemsAmbient == null)
			return "no 'ambient' element found in an 'spot'";
		if(elemsAmbient.length != 1)
			return "either zero or more than one 'ambient' element found in a 'spot'.";
		var ambient = elemsAmbient[0];
		var ambientCoords = [];
		ambientCoords[0] = this.reader.getFloat(ambient, 'r');
		ambientCoords[1] = this.reader.getFloat(ambient, 'g');
		ambientCoords[2] = this.reader.getFloat(ambient, 'b');
		ambientCoords[3] = this.reader.getFloat(ambient, 'a');
		console.log("ambient: "+ambientCoords);

		//LIGHTS->SPOT->DIFFUSE
		var elemsDiffuse = spot.getElementsByTagName('diffuse');
		if(elemsDiffuse == null)
			return "no 'diffuse' element found in an 'spot'";
		if(elemsDiffuse.length != 1)
			return "either zero or more than one 'diffuse' element found in a 'spot'.";
		var diffuse = elemsDiffuse[0];
		var diffuseCoords = [];
		diffuseCoords[0] = this.reader.getFloat(diffuse, 'r');
		diffuseCoords[1] = this.reader.getFloat(diffuse, 'g');
		diffuseCoords[2] = this.reader.getFloat(diffuse, 'b');
		diffuseCoords[3] = this.reader.getFloat(diffuse, 'a');
		console.log("diffuse: "+diffuseCoords);

		//LIGHTS->SPOT->SPECULAR
		var elemsSpecular = spot.getElementsByTagName('specular');
		if(elemsSpecular == null)
			return "no 'specular' element found in an 'spot'";
		if(elemsSpecular.length != 1)
			return "either zero or more than one 'specular' element found in a 'spot'.";
		var specular = elemsSpecular[0];
		var specularCoords = [];
		specularCoords[0] = this.reader.getFloat(specular, 'r');
		specularCoords[1] = this.reader.getFloat(specular, 'g');
		specularCoords[2] = this.reader.getFloat(specular, 'b');
		specularCoords[3] = this.reader.getFloat(specular, 'a');
		console.log("specular: "+specularCoords);

	}
}


/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);
	this.loadedOk=false;
};


