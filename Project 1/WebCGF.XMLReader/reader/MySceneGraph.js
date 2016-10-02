
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
	var error = this.parseMaterials(rootElement);
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
		var fromInfo = [];
		fromInfo[0] = this.reader.getFloat(from, 'x');
		fromInfo[1] = this.reader.getFloat(from, 'y');
		fromInfo[2] = this.reader.getFloat(from, 'z');
		console.log("from: ("+fromInfo[0]+","+fromInfo[1]+","+fromInfo[2]+")");
		
		//VIEWS->PERSPECTIVE->TO
		var elemsTo = perspective.getElementsByTagName('to');
		if(elemsTo == null)
			return "no 'to' element found in a 'perspective'";
		if(elemsFrom.length != 1)
			return "either zero or more than one 'to' element found in a 'perspective'."
		var to = elemsTo[0];
		var toInfo = [];
		toInfo[0] = this.reader.getFloat(to, 'x');
		toInfo[1] = this.reader.getFloat(to, 'y');
		toInfo[2] = this.reader.getFloat(to, 'z');
		console.log("to: ("+toInfo[0]+","+toInfo[1]+","+toInfo[2]+")");

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
			return "either zero or more than one 'location' element found in an 'omni'.";
		var location = elemsLocation[0];
		var locationInfo = [];
		locationInfo[0] = this.reader.getFloat(location, 'x');
		locationInfo[1] = this.reader.getFloat(location, 'y');
		locationInfo[2] = this.reader.getFloat(location, 'z');
		locationInfo[3] = this.reader.getFloat(location, 'w');
		console.log("location: "+locationInfo);

		//LIGHTS->OMNI->AMBIENT
		var elemsAmbient = omni.getElementsByTagName('ambient');
		if(elemsAmbient == null)
			return "no 'ambient' element found in an 'omni'";
		if(elemsAmbient.length != 1)
			return "either zero or more than one 'ambient' element found in an 'omni'.";
		var ambient = elemsAmbient[0];
		var ambientInfo = [];
		ambientInfo[0] = this.reader.getFloat(ambient, 'r');
		ambientInfo[1] = this.reader.getFloat(ambient, 'g');
		ambientInfo[2] = this.reader.getFloat(ambient, 'b');
		ambientInfo[3] = this.reader.getFloat(ambient, 'a');
		console.log("ambient: "+ambientInfo);

		//LIGHTS->OMNI->DIFFUSE
		var elemsDiffuse = omni.getElementsByTagName('diffuse');
		if(elemsDiffuse == null)
			return "no 'diffuse' element found in an 'omni'";
		if(elemsDiffuse.length != 1)
			return "either zero or more than one 'diffuse' element found in an 'omni'.";
		var diffuse = elemsDiffuse[0];
		var diffuseInfo = [];
		diffuseInfo[0] = this.reader.getFloat(diffuse, 'r');
		diffuseInfo[1] = this.reader.getFloat(diffuse, 'g');
		diffuseInfo[2] = this.reader.getFloat(diffuse, 'b');
		diffuseInfo[3] = this.reader.getFloat(diffuse, 'a');
		console.log("diffuse: "+diffuseInfo);

		//LIGHTS->OMNI->SPECULAR
		var elemsSpecular = omni.getElementsByTagName('specular');
		if(elemsSpecular == null)
			return "no 'specular' element found in an 'omni'";
		if(elemsSpecular.length != 1)
			return "either zero or more than one 'specular' element found in an 'omni'.";
		var specular = elemsSpecular[0];
		var specularInfo = [];
		specularInfo[0] = this.reader.getFloat(specular, 'r');
		specularInfo[1] = this.reader.getFloat(specular, 'g');
		specularInfo[2] = this.reader.getFloat(specular, 'b');
		specularInfo[3] = this.reader.getFloat(specular, 'a');
		console.log("specular: "+specularInfo);

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
			return "no 'target' element found in a 'spot'";
		if(elemtsTarget.length != 1)
			return "either zero or more than one 'target' element found in a 'spot'.";
		var target = elemtsTarget[0];
		var targetInfo = [];
		targetInfo[0] = this.reader.getFloat(target, 'x');
		targetInfo[1] = this.reader.getFloat(target, 'y');
		targetInfo[2] = this.reader.getFloat(target, 'z');
		console.log("target: "+targetInfo);

		//LIGHTS->SPOT->LOCATION
		var elemsLocation = spot.getElementsByTagName('location');
		if(elemsLocation == null)
			return "no 'location' element found in a 'spot'";
		if(elemsLocation.length != 1)
			return "either zero or more than one 'location' element found in a 'spot'.";
		var location = elemsLocation[0];
		var locationInfo = [];
		locationInfo[0] = this.reader.getFloat(location, 'x');
		locationInfo[1] = this.reader.getFloat(location, 'y');
		locationInfo[2] = this.reader.getFloat(location, 'z');
		console.log("location: "+locationInfo);

		//LIGHTS->SPOT->AMBIENT
		var elemsAmbient = spot.getElementsByTagName('ambient');
		if(elemsAmbient == null)
			return "no 'ambient' element found in a 'spot'";
		if(elemsAmbient.length != 1)
			return "either zero or more than one 'ambient' element found in a 'spot'.";
		var ambient = elemsAmbient[0];
		var ambientInfo = [];
		ambientInfo[0] = this.reader.getFloat(ambient, 'r');
		ambientInfo[1] = this.reader.getFloat(ambient, 'g');
		ambientInfo[2] = this.reader.getFloat(ambient, 'b');
		ambientInfo[3] = this.reader.getFloat(ambient, 'a');
		console.log("ambient: "+ambientInfo);

		//LIGHTS->SPOT->DIFFUSE
		var elemsDiffuse = spot.getElementsByTagName('diffuse');
		if(elemsDiffuse == null)
			return "no 'diffuse' element found in a 'spot'";
		if(elemsDiffuse.length != 1)
			return "either zero or more than one 'diffuse' element found in a 'spot'.";
		var diffuse = elemsDiffuse[0];
		var diffuseInfo = [];
		diffuseInfo[0] = this.reader.getFloat(diffuse, 'r');
		diffuseInfo[1] = this.reader.getFloat(diffuse, 'g');
		diffuseInfo[2] = this.reader.getFloat(diffuse, 'b');
		diffuseInfo[3] = this.reader.getFloat(diffuse, 'a');
		console.log("diffuse: "+diffuseInfo);

		//LIGHTS->SPOT->SPECULAR
		var elemsSpecular = spot.getElementsByTagName('specular');
		if(elemsSpecular == null)
			return "no 'specular' element found in a 'spot'";
		if(elemsSpecular.length != 1)
			return "either zero or more than one 'specular' element found in a 'spot'.";
		var specular = elemsSpecular[0];
		var specularInfo = [];
		specularInfo[0] = this.reader.getFloat(specular, 'r');
		specularInfo[1] = this.reader.getFloat(specular, 'g');
		specularInfo[2] = this.reader.getFloat(specular, 'b');
		specularInfo[3] = this.reader.getFloat(specular, 'a');
		console.log("specular: "+specularInfo);

	}
}

MySceneGraph.prototype.parseMaterials= function(rootElement) {
	
	var elems =  rootElement.getElementsByTagName('materials');
	if (elems == null) {
		return "materials element is missing.";
	}
	if (elems.length != 1) {
		return "either zero or more than one 'materials' element found.";
	}

	//MATERIALS->MATERIAL
	var materials = elems[0].getElementsByTagName('material');
	if(materials==null) return "no 'material' element found in 'materials'";
	for(var i=0; i<materials.length; i++)
	{
		var material = materials[i];
		var id = this.reader.getString(material, 'id');
		console.log("id="+id);

		//MATERIALS->MATERIAL->EMISSION
		var elemsEmission = material.getElementsByTagName('emission');
		if(elemsEmission==null) return "no 'emission' found in a 'material'";
		if(elemsEmission.length!=1) return "either zero or more than one 'emission' found in a 'material'";
		var emission = elemsEmission[0];
		emissionInfo=[];
		emissionInfo[0]=this.reader.getFloat(emission, 'r');
		emissionInfo[1]=this.reader.getFloat(emission, 'g');
		emissionInfo[2]=this.reader.getFloat(emission, 'b');
		emissionInfo[3]=this.reader.getFloat(emission, 'a');
		console.log("emission="+emissionInfo);

		//MATERIALS->MATERIAL->AMBIENT
		var elemsAmbient = material.getElementsByTagName('ambient');
		if(elemsAmbient==null) return "no 'ambient' found in a 'material'";
		if(elemsAmbient.length!=1) return "either zero or more than one 'ambient' found in a 'material'";
		var ambient = elemsAmbient[0];
		ambientInfo=[];
		ambientInfo[0]=this.reader.getFloat(ambient, 'r');
		ambientInfo[1]=this.reader.getFloat(ambient, 'g');
		ambientInfo[2]=this.reader.getFloat(ambient, 'b');
		ambientInfo[3]=this.reader.getFloat(ambient, 'a');
		console.log("ambient="+ambientInfo);

		//MATERIALS->MATERIAL->DIFFUSE
		var elemsDiffuse = material.getElementsByTagName('diffuse');
		if(elemsDiffuse==null) return "no 'diffuse' found in a 'material'";
		if(elemsDiffuse.length!=1) return "either zero or more than one 'diffuse' found in a 'material'";
		var diffuse = elemsDiffuse[0];
		diffuseInfo=[];
		diffuseInfo[0]=this.reader.getFloat(diffuse, 'r');
		diffuseInfo[1]=this.reader.getFloat(diffuse, 'g');
		diffuseInfo[2]=this.reader.getFloat(diffuse, 'b');
		diffuseInfo[3]=this.reader.getFloat(diffuse, 'a');
		console.log("diffuse="+diffuseInfo);

		//MATERIALS->MATERIAL->SPECULAR
		var elemsSpecular = material.getElementsByTagName('specular');
		if(elemsSpecular==null) return "no 'specular' found in a 'material'";
		if(elemsSpecular.length!=1) return "either zero or more than one 'specular' found in a 'material'";
		var specular = elemsSpecular[0];
		specularInfo=[];
		specularInfo[0]=this.reader.getFloat(specular, 'r');
		specularInfo[1]=this.reader.getFloat(specular, 'g');
		specularInfo[2]=this.reader.getFloat(specular, 'b');
		specularInfo[3]=this.reader.getFloat(specular, 'a');
		console.log("specular="+specularInfo);

		//MATERIALS->MATERIAL->SHININESS
		var elemsShininess = material.getElementsByTagName('shininess');
		if(elemsShininess==null) return "no 'shininess' found in a 'material'";
		if(elemsShininess.length!=1) return "either zero or more than one 'shininess' found in a 'material'";
		var shininess = elemsShininess[0];
		var value=this.reader.getFloat(shininess, 'value');
		console.log("value="+value);


	}
}


/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);
	this.loadedOk=false;
};


