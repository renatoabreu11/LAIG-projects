
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;

	//Scene block values
	this.views = [];
	this.illumination = [];
	this.omniLights = [];
	this.spotLights = [];
	this.textures = [];
	this.materials = [];
	this.transformations = [];


	this.defaultView;
	this.root;
	this.axisLength;

	//missing elements 
	this.elementsErrors = [];
	//missing block values
	this.blockErrors = [];

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
	
	// Call to the function that receives the root element and the list of blocks. This function calls the respective function to each block.
	var blocks = ['scene', 'views', 'illumination', 'lights', 'textures', 'materials', 'transformations', 'primitives', 'components'];
	this.parseBlocks(rootElement, blocks);
		
	if(this.elementsErrors.length != 0){
		for(var i = 0; i < this.elementsErrors.length; i++){
			this.onXMLError(this.elementsErrors[i]);
		};
		return;	
	}else{
	
		this.loadedOk=true;
	
		// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
		this.scene.onGraphLoaded();
	}
};

/*
 * Method that search for each block in the blocksTag list and than calls the function to parse its elements
 */
MySceneGraph.prototype.parseBlocks= function(rootElement, blocksTag) {
	var skipBlock = 0;

	for(var i = 0; i < blocksTag.length; i++){
		var elements =  rootElement.getElementsByTagName(blocksTag[i]);

		if (elements == null) {
			this.elementsErrors.push(blocksTag[i] + " element is missing.");
			skipBlock = 1;
		}
		if(blocksTag[i] = 'materials')
			console.log(elements.length);
		if (elements.length != 1 && skipBlock == 0) {
			this.elementsErrors.push("either zero or more than one " + blocksTag[i] + " element found.");
			skipBlock = 1;
		}

		if(skipBlock == 0){
			switch(i){
				case 0: this.parseGlobals(rootElement, elements); break;
				case 1: this.parseViews(rootElement, elements); break;
				case 2: this.parseIllumination(rootElement, elements); break;
				case 3: this.parseLights(rootElement, elements); break;
				case 4: this.parseTextures(rootElement, elements); break;
				case 5: this.parseMaterials(rootElement, elements); break;
				case 6: this.parseTransformations(rootElement, elements); break;
				case 7: this.parsePrimitives(rootElement, elements); break;
				case 8: this.parseComponents(rootElement, elements); break;
				default: break;
			}
		} else skipBlock = 0;
	}
};


MySceneGraph.prototype.parseGlobals= function(rootElement, blockInfo) {
	var scene = blockInfo[0];
	this.root = this.reader.getString(scene, 'root');
	this.axisLength = this.reader.getFloat(scene, 'axis_length');
};

MySceneGraph.prototype.parseViews= function(rootElement, blockInfo) {
	var viewsBlock = blockInfo[0];
	this.defaultView = this.reader.getString(viewsBlock, 'default');

	//VIEWS->PERSPECTIVE
	var perspBlock = this.getElements('perspective', viewsBlock, 1);
	if(perspBlock == null)
		return;

	var coords = ['x', 'y', 'z'];

	for(var i=0; i < perspBlock.length; i++)
	{
		var perspective = perspBlock[i];
		this.views[i] = [];
		this.views[i]["id"] = this.reader.getString(perspective, 'id');
		this.views[i]["near"] = this.reader.getFloat(perspective, 'near');
		this.views[i]["far"] = this.reader.getFloat(perspective, 'far');
		this.views[i]["angle"] = this.reader.getFloat(perspective, 'angle');

		console.log(this.views[i]);

		//VIEWS->PERSPECTIVE->FROM
		var fromBlock = this.getElements('from', perspective, 0);
		if(fromBlock == null)
			return;

		this.views[i]["from"] = [];
		for(var j = 0; j < coords.length; j++){
			this.views[i]["from"][coords[j]] = this.reader.getFloat(fromBlock[0], coords[j]);
		}

		console.log(this.views[i]["from"]);
		
		//VIEWS->PERSPECTIVE->TO
		var toBlock = this.getElements('to', perspective, 0);
		if(toBlock == null)
			return;
		
		this.views[i]["to"] = [];

		for(var j = 0; j < coords.length; j++){
			this.views[i]["to"][coords[j]] = this.reader.getFloat(toBlock[0], coords[j]);
		}

		console.log(this.views[i]["to"]);
	}
};

MySceneGraph.prototype.parseIllumination= function(rootElement, blockInfo) {
	var illuminationBlock = blockInfo[0];

	this.illumination["doublesided"] = this.reader.getBoolean(illuminationBlock, "doublesided");
	this.illumination["local"] = this.reader.getBoolean(illuminationBlock, "local");
	console.log(this.illumination);

	//Illumination -> ambient
	var ambientBlock = this.getElements('ambient', illuminationBlock, 0);
	if(ambientBlock == null)
		return;

	var backgroundBlock = this.getElements('background', illuminationBlock, 0);
	if(backgroundBlock == null)
		return;

	var colors = ['r', 'g', 'b', 'a'];
	this.illumination["ambient"] = [];
	this.illumination["background"] = [];

	for(var i = 0; i < colors.length; i++){
		this.illumination["ambient"][colors[i]] = this.reader.getFloat(ambientBlock[0], colors[i]);
		this.illumination["background"][colors[i]] = this.reader.getFloat(backgroundBlock[0], colors[i]);
	}

	console.log(this.illumination["ambient"]);
	console.log(this.illumination["background"]);
};

MySceneGraph.prototype.parseLights= function(rootElement, blockInfo) {
	//LIGHTS
	var omniBlock = this.getElements('omni', blockInfo[0], 1);
	if (omniBlock == null) {
		return;
	}

	var spotBlock = this.getElements('spot', blockInfo[0], 1);
	if (spotBlock == null) {
		return;
	}

	var coords = ['x', 'y', 'z', 'w'];
	var colors = ['r', 'g', 'b', 'a'];

	//LIGHTS->OMNI
	for(var i=0; i < omniBlock.length; i++)
	{
		var omni = omniBlock[i];
		this.omniLights[i] = [];
		this.omniLights[i]["id"] = this.reader.getString(omni, 'id');
		this.omniLights[i]["enabled"] = this.reader.getBoolean(omni, 'enabled');
		console.log(this.omniLights[i]);

		//LIGHTS->OMNI->LOCATION
		var locationBlock = this.getElements('location', omni, 0);
		if(locationBlock == null)
			return;		

		this.omniLights[i]["location"] = [];
		for(var j = 0; j < coords.length; j++){
			this.omniLights[i]["location"][coords[j]] = this.reader.getFloat(locationBlock[0], coords[j]);
		}
		
		console.log(this.omniLights[i]["location"]);

		//LIGHTS->OMNI->AMBIENT
		var ambientBlock = this.getElements('ambient', omni, 0);
		if(ambientBlock == null)
			return;		

		this.omniLights[i]["ambient"] = [];
		for(var j = 0; j < colors.length; j++){
			this.omniLights[i]["ambient"][colors[j]] = this.reader.getFloat(ambientBlock[0], colors[j]);
		}

		//LIGHTS->OMNI->DIFFUSE
		var diffuseBlock = this.getElements('diffuse', omni, 0);
		if(diffuseBlock == null)
			return;		

		this.omniLights[i]["diffuse"] = [];
		for(var j = 0; j < colors.length; j++){
			this.omniLights[i]["diffuse"][colors[j]] = this.reader.getFloat(diffuseBlock[0], colors[j]);
		}

		//LIGHTS->OMNI->SPECULAR
		var specularBlock = this.getElements('specular', omni, 0);
		if(specularBlock == null)
			return;		

		this.omniLights[i]["specular"] = [];
		for(var j = 0; j < colors.length; j++){
			this.omniLights[i]["specular"][colors[j]] = this.reader.getFloat(specularBlock[0], colors[j]);
		}
	}

	//LIGHTS->SPOT
	for(var i=0; i<spotBlock.length; i++)
	{
		var spot = spotBlock[i];
		this.spotLights[i] = [];
		this.spotLights[i]["id"] = this.reader.getString(spot, 'id');
		this.spotLights[i]["enabled"] = this.reader.getBoolean(spot, 'enabled');
		this.spotLights[i]["angle"] = this.reader.getFloat(spot, 'angle');
		this.spotLights[i]["exponent"] = this.reader.getFloat(spot, 'exponent');
		
		console.log(this.spotLights[i]);

		//LIGHTS->SPOT->TARGET
		var targetBlock = this.getElements('target', spot, 0);
		if(targetBlock == null)
			return;		

		this.spotLights[i]["target"] = [];
		for(var j = 0; j < coords.length - 1; j++){
			this.spotLights[i]["target"][coords[j]] = this.reader.getFloat(targetBlock[0], coords[j]);
		}

		//LIGHTS->SPOT->LOCATION
		var locationBlock = this.getElements('location', spot, 0);
		if(locationBlock == null)
			return;		

		this.spotLights[i]["location"] = [];
		for(var j = 0; j < coords.length - 1; j++){
			this.spotLights[i]["location"][coords[j]] = this.reader.getFloat(locationBlock[0], coords[j]);
		}

		//LIGHTS->SPOT->AMBIENT
		var ambientBlock = this.getElements('ambient', spot, 0);
		if(ambientBlock == null)
			return;		

		this.spotLights[i]["ambient"] = [];
		for(var j = 0; j < colors.length; j++){
			this.spotLights[i]["ambient"][colors[j]] = this.reader.getFloat(ambientBlock[0], colors[j]);
		}

		//LIGHTS->SPOT->DIFFUSE
		var diffuseBlock = this.getElements('diffuse', spot, 0);
		if(diffuseBlock == null)
			return;		

		this.spotLights[i]["diffuse"] = [];
		for(var j = 0; j < colors.length; j++){
			this.spotLights[i]["diffuse"][colors[j]] = this.reader.getFloat(diffuseBlock[0], colors[j]);
		}

		//LIGHTS->SPOT->SPECULAR
		var specularBlock = this.getElements('specular', spot, 0);
		if(specularBlock == null)
			return;		


		this.spotLights[i]["specular"] = [];
		for(var j = 0; j < colors.length; j++){
			this.spotLights[i]["specular"][colors[j]] = this.reader.getFloat(specularBlock[0], colors[j]);
		}
	}
};

MySceneGraph.prototype.parseTextures= function(rootElement, blockInfo) {
	var texturesBlock = blockInfo[0];

	//Textures->Texture
	var texBlock = this.getElements('texture', texturesBlock, 1);
	if(texBlock == null)
		return;

	for(var i=0; i < texBlock.length; i++)
	{
		var texture = texBlock[i];
		this.textures[i] = [];
		this.textures[i]["id"] = this.reader.getString(texture, 'id');
		this.textures[i]["file"] = this.reader.getString(texture, 'file');
		this.textures[i]["length_s"] = this.reader.getFloat(texture, 'length_s');
		this.textures[i]["length_t"] = this.reader.getFloat(texture, 'length_t');

		console.log(this.textures[i]);
	}
};

MySceneGraph.prototype.parseMaterials= function(rootElement, blockInfo) {
	var materialsBlock =  blockInfo[0];

	//Materials->Material
	var matBlock = this.getElements('material', materialsBlock, 1);
	if(matBlock == null)
		return;

	var colors = ['r', 'g', 'b', 'a'];

	for(var i=0; i < matBlock.length; i++)
	{
		var material = matBlock[i];
		this.materials[i] = [];
		this.materials[i]["id"] = this.reader.getString(material, 'id');

		//MATERIALS->MATERIAL->EMISSION
		var emissionBlock = this.getElements('emission', material, 0);
		if(emissionBlock == null)
			return;

		this.materials[i]["emission"] = [];
		for(var j = 0; j < colors.length; j++){
			this.materials[i]["emission"][colors[j]] = this.reader.getFloat(emissionBlock[0], colors[j]);
		}

		//MATERIALS->MATERIAL->AMBIENT
		var ambientBlock = this.getElements('ambient', material, 0);
		if(ambientBlock == null)
			return;

		this.materials[i]["ambient"] = [];
		for(var j = 0; j < colors.length; j++){
			this.materials[i]["ambient"][colors[j]] = this.reader.getFloat(ambientBlock[0], colors[j]);
		}

		//MATERIALS->MATERIAL->DIFFUSE
		var diffuseBlock = this.getElements('diffuse', material, 0);
		if(diffuseBlock == null)
			return;		

		this.materials[i]["diffuse"] = [];
		for(var j = 0; j < colors.length; j++){
			this.materials[i]["diffuse"][colors[j]] = this.reader.getFloat(diffuseBlock[0], colors[j]);
		}

		//MATERIALS->MATERIAL->SPECULAR
		var specularBlock = this.getElements('specular', material, 0);
		if(specularBlock == null)
			return;		

		this.materials[i]["specular"] = [];
		for(var j = 0; j < colors.length; j++){
			this.materials[i]["specular"][colors[j]] = this.reader.getFloat(specularBlock[0], colors[j]);
		}

		console.log(this.materials[i]);

		//MATERIALS->MATERIAL->SHININESS
		var shininessBlock = this.getElements('shininess', material, 0);
		if(shininessBlock == null)
			return;

		this.materials[i]["shininess"] = this.reader.getFloat(shininessBlock[0], 'value');

		console.log(this.materials[i]);
	}
};

MySceneGraph.prototype.parseTransformations= function(rootElement, blockInfo) {
	var transformationsBlock = blockInfo[0];

	//Transformations->transformation
	var transBlock = this.getElements('transformation', transformationsBlock, 1);
	if(transBlock == null)
		return;

	var coords = ['x', 'y', 'z'];

	for(var i=0; i < transBlock.length; i++)
	{
		var transformation = transBlock[i];
		this.transformations[i] = [];
		this.transformations[i]["id"] = this.reader.getString(transformation, 'id');

		console.log(this.transformations[i])

		//Transformation->translate
		var translateBlock =  this.getElements('translate', transformation, 1);
		if(translateBlock != null){
			this.transformations[i]["translate"] = [];
			for(var j = 0; j < coords.length; j++){
				this.transformations[i]["translate"][coords[j]] = this.reader.getFloat(translateBlock[0], coords[j]);
			}
		}

		//Transformation->scale
		var scaleBlock =  this.getElements('scale', transformation, 1);
		if(scaleBlock != null){
			this.transformations[i]["scale"] = [];
			for(var j = 0; j < coords.length; j++){
				this.transformations[i]["scale"][coords[j]] = this.reader.getFloat(scaleBlock[0], coords[j]);
			}
		}

		//Transformation->rotate
		var rotateBlock =  this.getElements('rotate', transformation, 1);
		if(rotateBlock != null){
			this.transformations[i]["rotate"] = [];
			this.transformations[i]["rotate"]["axis"] = this.reader.getString(rotateBlock[0], 'axis');
			this.transformations[i]["rotate"]["angle"] = this.reader.getFloat(rotateBlock[0], 'angle');
		}

		console.log(this.transformations[i]);
	}
};

MySceneGraph.prototype.parsePrimitives= function(rootElement, blockInfo) {
	
};

MySceneGraph.prototype.parseComponents= function(rootElement, blockInfo) {
	
};

//@param isList -> if the block to inspect can have more than one element than we just need to check if the number
//of tags is less than 1
MySceneGraph.prototype.getElements= function(tag, block, isList){
	tagBlock = block.getElementsByTagName(tag);

	if(tagBlock == null){
			this.blockErrors.push("no " + tag + " element found in" + block);
			return null;	
	}

	if(isList){
		if (tagBlock.length < 1){
			this.blockErrors.push("no " + tag + " element found in " + block);
			return null;
		}
	} else{
		if(tagBlock.length != 1){
			this.blockErrors.push("either zero or more than one " + tag + " element found " + block);
			return null;
		}
	}
	return tagBlock;
}

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+ message);
	this.loadedOk=false;
};


