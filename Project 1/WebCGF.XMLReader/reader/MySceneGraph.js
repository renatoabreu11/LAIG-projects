/**
 * [MySceneGraph description]
 * @param {[type]} filename [description]
 * @param {[type]} scene    [description]
 */
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;

	//Scene block values
	this.views = [];
	this.illumination = [];
	this.lights = [];
	this.textures = [];
	this.materials = [];
	this.transformations = [];
	this.primitives = [];
	this.components = [];


	this.defaultView;
	this.root;
	this.axisLength;

	//missing elements 
	this.elementsErrors = [];
	//missing block values
	this.blockWarnings = [];

	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  
}

/**
 * [onXMLReady description]
 * @return {[type]} [description]
 */
MySceneGraph.prototype.onXMLReady=function() {
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Call to the function that receives the root element and the list of blocks. This function calls the respective function to each block.
	this.parseBlocks(rootElement);

	for(var i = 0; i < this.blockWarnings.length; i++){
		this.onXMLWarning(this.blockWarnings[i]);
	}
		
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

/**
 * [parseBlocks description]
 * @param  {[type]} rootElement [description]
 * @param  {[type]} blocksTag   [description]
 * @return {[type]}             [description]
 */
MySceneGraph.prototype.parseBlocks= function(rootElement, blocksTag) {
	var nBlocks = rootElement.children.length;

	var validBlocks = this.checkBlockOrder(rootElement,nBlocks);
	if(!validBlocks)
		return;

	for(var i=0; i < nBlocks; i++){
		var block = rootElement.children[i];
		switch(block.tagName){
			case 'scene':{
				this.parseGlobals(rootElement, block); break;
			}
			case 'views':{
				this.parseViews(rootElement, block); break;
			} 
			case 'illumination':{
				this.parseIllumination(rootElement, block); break;
			}
			case 'lights':{
				this.parseLights(rootElement, block);  break;
			}
			case 'textures':{
				this.parseTextures(rootElement, block); break;
			} 
			case 'materials':{
				this.parseMaterials(rootElement, block); break;
			}
			case 'transformations':{
				this.parseTransformations(rootElement, block); break;
			} 
			case 'primitives':{
				this.parsePrimitives(rootElement, block); break;
			}
			case 'components':{
				this.parseComponents(rootElement, block); 
				this.checkChildrenID();
				break;
			}
		}
	}
};

/**
 * [checkBlockOrder description]
 * @param  {[type]} blocks  [description]
 * @param  {[type]} nBlocks [description]
 * @return {[type]}         [description]
 */
MySceneGraph.prototype.checkBlockOrder= function(blocks, nBlocks) {
	var tags = ['scene', 'views', 'illumination', 'lights', 'textures', 'materials', 'transformations', 'primitives', 'components'];

	if(nBlocks != 9){
		this.elementsErrors.push("The number of blocks must be 9: scene, views, illumination, lights, textures, materials, transformations, primitives, components");
		return false;
	}

	for(var i=0; i < nBlocks; i++){
		var block = blocks.children[i];
		if(block.tagName != tags[i]){
			this.elementsErrors.push("Wrong dsx block order");
			return false;
		}
	}
	return true;
}

/**
 * [parseGlobals description]
 * @param  {[type]} rootElement [description]
 * @param  {[type]} scene       [description]
 * @return {[type]}             [description]
 */
MySceneGraph.prototype.parseGlobals= function(rootElement, scene) {
	this.root = this.reader.getString(scene, 'root');
	if(this.root == null){
		this.elementsErrors.push("Root object is missing");
	}

	this.axisLength = this.reader.getFloat(scene, 'axis_length');
	this.checkFloatValue(this.axisLength, 'Axis length');
};

/**
 * [parseViews description]
 * @param  {[type]} rootElement [description]
 * @param  {[type]} viewsBlock  [description]
 * @return {[type]}             [description]
 */
MySceneGraph.prototype.parseViews= function(rootElement, viewsBlock) {
	//VIEWS->PERSPECTIVE
	var perspBlock = this.getElements('perspective', viewsBlock, 1);
	if(perspBlock == null)
		return;

	for(var i=0; i < perspBlock.length; i++)
	{
		var perspective = perspBlock[i];

		var id = this.reader.getString(perspective, 'id');
		
		if(id == null){
			this.blockWarnings.push("Perspective ID is missing");
			break;
		}

		var idExists = false;
		for(var view of this.views){
			if(view["id"] == id){
				this.blockWarnings.push("Perspective with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			var view = [];
			view["id"] = id;

			view["near"] = this.reader.getFloat(perspective, 'near');
			this.checkFloatValue(view["near"], 'Near');
			view["far"] = this.reader.getFloat(perspective, 'far');
			this.checkFloatValue(view["far"], 'Far');
			view["angle"] = this.reader.getFloat(perspective, 'angle');
			this.checkFloatValue(view["angle"], 'Angle');
			view["angle"] = this.toRadians(view["angle"]);

			//VIEWS->PERSPECTIVE->FROM
			var fromBlock = this.getElements('from', perspective, 0);
			if(fromBlock == null)
				return;
			view["from"] = this.readValues(['x', 'y', 'z'], fromBlock[0]);
			
			//VIEWS->PERSPECTIVE->TO
			var toBlock = this.getElements('to', perspective, 0);
			if(toBlock == null)
				return;
			view["to"] = this.readValues(['x', 'y', 'z'], toBlock[0]);

			this.views.push(view);
		}
	}

	this.defaultView = this.reader.getString(viewsBlock, 'default');
	if(this.defaultView == null){
		this.blockWarnings.push("Default View is missing");
	} else{
		var idFound = false;
		for(var view of this.views){
			if(view["id"] == this.defaultView){
				idFound = true;
				break;
			}
		}

		if(!idFound){
			this.blockWarnings.push("Default View selected doesn't exist. View with id: " +
									this.views[0]["id"] + " defined as default view.");
			this.defaultView = this.views[0]["id"];
		}
	}
};

/**
 * [parseIllumination description]
 * @param  {[type]} rootElement       [description]
 * @param  {[type]} illuminationBlock [description]
 * @return {[type]}                   [description]
 */
MySceneGraph.prototype.parseIllumination= function(rootElement, illuminationBlock) {
	this.illumination["doublesided"] = this.reader.getBoolean(illuminationBlock, "doublesided");
	this.illumination["local"] = this.reader.getBoolean(illuminationBlock, "local");

	//Illumination -> ambient
	var ambientBlock = this.getElements('ambient', illuminationBlock, 0);
	if(ambientBlock == null)
		return;

	//Illumination -> background
	var backgroundBlock = this.getElements('background', illuminationBlock, 0);
	if(backgroundBlock == null)
		return;

	this.illumination["ambient"] = this.readValues(['r', 'g', 'b', 'a'], ambientBlock[0]);
	this.illumination["background"] = this.readValues(['r', 'g', 'b', 'a'], backgroundBlock[0]);
};

/**
 * [parseLights description]
 * @param  {[type]} rootElement [description]
 * @param  {[type]} lightsBlock [description]
 * @return {[type]}             [description]
 */
MySceneGraph.prototype.parseLights= function(rootElement, lightsBlock) {
	//LIGHTS
	var nLights = lightsBlock.children.length;

	if(nLights == 0){
		this.elementsErrors.push("At least one light (spot or omni type) must be present")
		return;
	}

	for(var i=0; i < nLights; i++){
		var light = lightsBlock.children[i];
		switch(light.tagName){
			case "omni":{
				this.parseOmniLight(light);
				break;
			}
			case "spot":{
				this.parseSpotLight(light);
				break;
			}
		}
	}
};

/**
 * [parseOmniLight description]
 * @param  {[type]} omni [description]
 * @return {[type]}      [description]
 */
MySceneGraph.prototype.parseOmniLight= function(omni) {
	//LIGHTS->OMNI

	var id = this.reader.getString(omni, 'id');
	var idExists = false;

	for(var light of this.lights){
		if(light["id"] == id){
			this.blockWarnings.push(light["type"] + " with id: " + id + " already exists");
			idExists = true;
		}
	}

	if(!idExists){
		var light = [];
		light["id"] = id;
		light["type"] = "omni";
		light["enabled"] = this.reader.getBoolean(omni, 'enabled');

		//LIGHTS->OMNI->LOCATION
		var locationBlock = this.getElements('location', omni, 0);
		if(locationBlock == null)
			return;		
		light["location"] = this.readValues(['x', 'y', 'z', 'w'], locationBlock[0]);

		//LIGHTS->OMNI->AMBIENT
		var ambientBlock = this.getElements('ambient', omni, 0);
		if(ambientBlock == null)
			return;		
		light["ambient"] = this.readValues(['r', 'g', 'b', 'a'], ambientBlock[0]);

		//LIGHTS->OMNI->DIFFUSE
		var diffuseBlock = this.getElements('diffuse', omni, 0);
		if(diffuseBlock == null)
			return;		
		light["diffuse"] = this.readValues(['r', 'g', 'b', 'a'], diffuseBlock[0]);

		//LIGHTS->OMNI->SPECULAR
		var specularBlock = this.getElements('specular', omni, 0);
		if(specularBlock == null)
			return;		
		light["specular"] = this.readValues(['r', 'g', 'b', 'a'], specularBlock[0]);

		this.lights.push(light);
		this.nLights++;
	}
}

/**
 * [parseSpotLight description]
 * @param  {[type]} spot [description]
 * @return {[type]}      [description]
 */
MySceneGraph.prototype.parseSpotLight= function(spot) {
	//LIGHTS->SPOT

	var id = this.reader.getString(spot, 'id');
	var idExists = false;

	for(var light of this.lights){
		if(light["id"] == id){
			this.blockWarnings.push(light["type"] + " with id: " + id + " already exists");
			idExists = true;
		}
	}

	if(!idExists){
		var light = [];
		light["id"] = id;
		light["type"] = "spot";
		light["enabled"] = this.reader.getBoolean(spot, 'enabled');

		light["angle"] = this.reader.getFloat(spot, 'angle');
		this.checkFloatValue(light["angle"], 'Angle');
		light["angle"] = this.toRadians(light["angle"]);

		light["exponent"] = this.reader.getFloat(spot, 'exponent');
		this.checkFloatValue(light["exponent"], 'Exponent');

		//LIGHTS->SPOT->TARGET
		var targetBlock = this.getElements('target', spot, 0);
		if(targetBlock == null)
			return;		
		light["target"] = this.readValues(['x', 'y', 'z'], targetBlock[0]);


		//LIGHTS->SPOT->LOCATION
		var locationBlock = this.getElements('location', spot, 0);
		if(locationBlock == null)
			return;		
		light["location"] = this.readValues(['x', 'y', 'z'], locationBlock[0]);
		light["location"]["w"] = 1;

		//LIGHTS->SPOT->AMBIENT
		var ambientBlock = this.getElements('ambient', spot, 0);
		if(ambientBlock == null)
			return;		
		light["ambient"] = this.readValues(['r', 'g', 'b', 'a'], ambientBlock[0]);

		//LIGHTS->SPOT->DIFFUSE
		var diffuseBlock = this.getElements('diffuse', spot, 0);
		if(diffuseBlock == null)
			return;		
		light["diffuse"] = this.readValues(['r', 'g', 'b', 'a'], diffuseBlock[0]);

		//LIGHTS->SPOT->SPECULAR
		var specularBlock = this.getElements('specular', spot, 0);
		if(specularBlock == null)
			return;		
		light["specular"] = this.readValues(['r', 'g', 'b', 'a'], specularBlock[0]);

		this.lights.push(light)
		this.nLights++;
	}
}

/**
 * [parseTextures description]
 * @param  {[type]} rootElement   [description]
 * @param  {[type]} texturesBlock [description]
 * @return {[type]}               [description]
 */
MySceneGraph.prototype.parseTextures= function(rootElement, texturesBlock) {
	//Textures->Texture
	var texBlock = this.getElements('texture', texturesBlock, 1);
	if(texBlock == null)
		return;

	for(var i=0; i < texBlock.length; i++)
	{
		var texture = texBlock[i];
		var id = this.reader.getString(texture, 'id');
		var idExists = false;

		for(tex of this.textures){
			if(tex["id"] == id){
				this.blockWarnings.push("Texture with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			var tex = [];
			tex["id"] = id;
			tex["file"] = this.reader.getString(texture, 'file');
			tex["length_s"] = this.reader.getFloat(texture, 'length_s');
			this.checkFloatValue(tex["length_s"], 'Length_s');
			tex["length_t"] = this.reader.getFloat(texture, 'length_t');
			this.checkFloatValue(tex["length_t"], 'Length_t');
			var info = new CGFtexture(this.scene, tex["file"]);
			tex["info"] = info;
			this.textures.push(tex);
		}
	}
};

/**
 * [parseMaterials description]
 * @param  {[type]} rootElement    [description]
 * @param  {[type]} materialsBlock [description]
 * @return {[type]}                [description]
 */
MySceneGraph.prototype.parseMaterials= function(rootElement, materialsBlock) {
	//Materials->Material
	var matBlock = this.getElements('material', materialsBlock, 1);
	if(matBlock == null) 
		return;

	for(var i=0; i < matBlock.length; i++)
	{
		var materialInfo = matBlock[i];
		var id = this.reader.getString(materialInfo, 'id');
		var idExists = false;

		for(var material of this.materials){
			if(material["id"] == id){
				this.blockWarnings.push("Material with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			var material = [];

			//MATERIALS->MATERIAL->EMISSION
			var emissionBlock = this.getElements('emission', materialInfo, 0);
			if(emissionBlock == null)
				return;
			material["emission"] = this.readValues(['r', 'g', 'b', 'a'], emissionBlock[0]);

			//MATERIALS->MATERIAL->AMBIENT
			var ambientBlock = this.getElements('ambient', materialInfo, 0);
			if(ambientBlock == null)
				return;
			material["ambient"] = this.readValues(['r', 'g', 'b', 'a'], ambientBlock[0]);

			//MATERIALS->MATERIAL->DIFFUSE
			var diffuseBlock = this.getElements('diffuse', materialInfo, 0);
			if(diffuseBlock == null)
				return;		
			material["diffuse"] = this.readValues(['r', 'g', 'b', 'a'], diffuseBlock[0]);

			//MATERIALS->MATERIAL->SPECULAR
			var specularBlock = this.getElements('specular', materialInfo, 0);
			if(specularBlock == null)
				return;		
			material["specular"] = this.readValues(['r', 'g', 'b', 'a'], specularBlock[0]);

			//MATERIALS->MATERIAL->SHININESS
			var shininessBlock = this.getElements('shininess', materialInfo, 0);
			if(shininessBlock == null)
				return;

			material["shininess"] = this.reader.getFloat(shininessBlock[0], 'value');
			this.checkFloatValue(material["shininess"], "Shininess");

			var appearance = new CGFappearance(this.scene);
			appearance.setSpecular(material["specular"]["r"], material["specular"]["g"], material["specular"]["b"], material["specular"]["a"]);
			appearance.setAmbient(material["ambient"]["r"], material["ambient"]["g"], material["ambient"]["b"], material["ambient"]["a"]);
			appearance.setDiffuse(material["diffuse"]["r"], material["diffuse"]["g"], material["diffuse"]["b"], material["diffuse"]["a"]);			
			appearance.setShininess(material["shininess"]);
			appearance.setEmission(material["emission"]["r"], material["emission"]["g"], material["emission"]["b"], material["emission"]["a"]);

			var mat = [];
			mat["id"] = id;
			mat["appear"] = appearance;
 			this.materials.push(mat);
		}
	}
};

/**
 * [parseTransformations description]
 * @param  {[type]} rootElement          [description]
 * @param  {[type]} transformationsBlock [description]
 * @return {[type]}                      [description]
 */
MySceneGraph.prototype.parseTransformations= function(rootElement, transformationsBlock) {
	//Transformations->transformation
	var transBlock = this.getElements('transformation', transformationsBlock, 1);
	if(transBlock == null)
		return;

	for(var i=0; i < transBlock.length; i++)
	{
		var transformation = transBlock[i];
		var id = this.reader.getString(transformation, 'id');
		var idExists = false;

		for(var transf of this.transformations){
			if(transf["id"] == id){
				this.blockWarnings.push("Transformation with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			var matrix = mat4.create();
			matrix = mat4.identity(matrix);

			var transf = [];
			transf["id"] = id;

			var nTransforms = transformation.children.length;
			if(nTransforms == 0){
				this.blockWarnings.push("At least one transformation must be present on block with id: " + i);
			} else{
				for(var j = 0; j < nTransforms; j++){
					var tagName = transformation.children[j].tagName;
					matrix = this.computeTransformation(tagName, matrix, transformation.children[j]);
				}
			}
			transf["matrix"] = matrix;
			this.transformations.push(transf);
		}
	}
};

/**
 * [parsePrimitives description]
 * @param  {[type]} rootElement     [description]
 * @param  {[type]} primitivesBlock [description]
 * @return {[type]}                 [description]
 */
MySceneGraph.prototype.parsePrimitives= function(rootElement, primitivesBlock) {
	//Primitives->primitive
	var primBlock = this.getElements('primitive', primitivesBlock, 1);
	if(primBlock == null)
		return;

	for(var i=0; i < primBlock.length; i++)
	{
		var primitive = primBlock[i];
		var id = this.reader.getString(primitive, 'id');
		var idExists = false;

		for(var prim of this.primitives){
			if(prim["id"] == id){
				this.blockWarnings.push("Primitive with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			var prim = [];
			prim["id"] = id;

			var nPrimitives = primitive.children.length;
			if(nPrimitives > 1){
				this.blockWarnings.push("More than one type of primitive per block");
			} else{
				var tagName = primitive.children[0].tagName;
				prim['tag']=tagName;
				switch(tagName){
					case 'rectangle':{
						prim[tagName] = this.readValues(['x1', 'y1', 'x2', 'y2'], primitive.children[0])
						break;
					}
					case 'triangle':{
						prim[tagName] = this.readValues(['x1', 'y1', 'z1', 'x2', 'y2', 'z2','x3', 'y3', 'z3'], primitive.children[0])
						break;
					}
					case 'cylinder':{
						prim[tagName] = this.readValues(['base', 'top', 'height'], primitive.children[0]);
						prim[tagName]["slices"] = this.reader.getInteger(primitive.children[0], 'slices');
						prim[tagName]["stacks"] = this.reader.getInteger(primitive.children[0], 'stacks');
						break;
					}
					case 'sphere':{
						prim[tagName] = [];
						prim[tagName]["radius"] = this.reader.getFloat(primitive.children[0], 'radius');
						prim[tagName]["slices"] = this.reader.getInteger(primitive.children[0], 'slices');
						prim[tagName]["stacks"] = this.reader.getInteger(primitive.children[0], 'stacks');
						break;
					}
					case 'torus':{
						prim[tagName] = [];
						prim[tagName]["inner"] = this.reader.getFloat(primitive.children[0], 'inner');
						prim[tagName]["outer"] = this.reader.getFloat(primitive.children[0], 'outer');
						prim[tagName]["slices"] = this.reader.getInteger(primitive.children[0], 'slices');
						prim[tagName]["loops"] = this.reader.getInteger(primitive.children[0], 'loops');
						break;
					}
					default: break;
				}
			}
		}
		this.primitives.push(prim);
	}
};

/**
 * [parseComponents description]
 * @param  {[type]} rootElement     [description]
 * @param  {[type]} componentsBlock [description]
 * @return {[type]}                 [description]
 */
MySceneGraph.prototype.parseComponents= function(rootElement, componentsBlock) {
	//COMPONENTS
	var componentBlock = this.getElements('component', componentsBlock, 1);
	if(componentBlock==null)
		return;

	//COMPONENTS->COMPONENT
	for(var i=0; i<componentBlock.length; i++)
	{
		var component = componentBlock[i];
		var id = this.reader.getString(component, 'id');
		if(id==null)
			console.log(component);
		var idExists = false;

		for(var comp of this.components) {
			if(comp.getID() == id) {
				this.blockWarnings.push("Component with id: "+id+" already exists.");
				idExists=true;
			}
		}

		if(!idExists) {
			var comp = new Component(this.scene, id);

			//COMPONENTS->COMPONENT->TRANSFORMATION
			var transformationBlock = this.getElements('transformation', component, 0);
			if(transformationBlock==null)
				return;
			comp.setTransformation(this.parseTransfInComponent(transformationBlock[0]));

			//COMPONENTS->COMPONENT->MATERIALS
			var materialsBlock = this.getElements('materials', component, 0);
			if(materialsBlock==null)
				return;

			var nMaterials = materialsBlock[0].children.length;
			if(nMaterials == 0){
				this.blockWarnings.push("At least one material id must be defined inside each component");
			} else{
				for(var j = 0; j < nMaterials; j++){
					var material = materialsBlock[0].children[j];
					var id = this.reader.getString(material, 'id');
					var index = this.checkIfExists(this.materials, id);
					if(id == 'inherit'){
						var mat = [];
						mat["id"] = id;
						comp.addMaterial(mat);
					} else{
						if(index == -1){
							this.blockWarnings.push("Material with id: " + id + " referenced in component doesn't exist");
						} else{
							comp.addMaterial(this.materials[index]);
						}
					}
				}
			}

			//COMPONENTS->COMPONENT->TEXTURE
			var textureBlock = this.getElements('texture', component, 0);
			if(textureBlock==null)
				return;

			var id = this.reader.getString(textureBlock[0],'id');
			var index = this.checkIfExists(this.textures, id);
			if(id == 'none' || id == 'inherit'){
				var texture = [];
				texture["id"] = id;
				comp.setTexture(texture);
			} else{
				if(index == -1){
					this.blockWarnings.push("Texture with id: " + id + " referenced in component doesn't exist");
				} else{
					comp.setTexture(this.textures[index]);
				}
			}

			//COMPONENTS->COMPONENT->CHILDREN
			var childrenBlock = this.getElements('children', component, 0);
			if(childrenBlock==null)
				return;
			this.parseChildsInComponent(childrenBlock[0], comp)
			this.components.push(comp);
		}
	}
};

/**
 * [parseTransfInComponent description]
 * @param  {[type]} transformation [description]
 * @return {[type]}                [description]
 */
MySceneGraph.prototype.parseTransfInComponent=function(transformation) {
	var matrix = mat4.create();
	matrix = mat4.identity(matrix);
	var nTransforms = transformation.children.length;
	if(nTransforms == 0){
		return matrix;
	} else{
		for(var j = 0; j < nTransforms; j++){
			var transf = transformation.children[j];

			//checks if only exists the transformationref
			if(transf.tagName == 'transformationref' && nTransforms == 1){
				var id = this.reader.getString(transf, 'id');
				var index = this.checkIfExists(this.transformations, id);
				if(index != -1){
					return this.transformations[index]["matrix"];
				}else{
					this.blockWarnings.push("Transformationref with " + id + " within component doesn't exist");
					return matrix;
				}
			} else if(transf.tagName == 'transformationref' && nTransforms > 1){
				this.blockWarnings.push("Transformationref and explicit transformations exist within the same component");
				matrix = mat4.create();
				matrix = mat4.identity(matrix);
				return matrix;
			}
			matrix = this.computeTransformation(transf.tagName, matrix, transf)
		}
		return matrix;
	}
};

/**
 * [parseChildsInComponent description]
 * @param  {[type]} block [description]
 * @param  {[type]} comp  [description]
 * @return {[type]}       [description]
 */
MySceneGraph.prototype.parseChildsInComponent=function(block, comp) {
	var nChilds = block.children.length;
	if(nChilds == 0){
		this.blockWarnings.push("No componentref nor primitiveref found!")
		return;
	} else{
		for(var j = 0; j < nChilds; j++){
			var child = block.children[j];
			switch(child.tagName){
				case 'componentref':{
					var id = this.reader.getString(block.children[j],'id');
					comp.addComponentID(id);
					break;
				}
				case 'primitiveref':{
					var id = this.reader.getString(block.children[j],'id');
					comp.addPrimitiveID(id);
					break;
				}
				default:
					this.blockWarnings.push("Invalid children tag name in component block")
					break;
			}
		}
	}
};

/**
 * [checkChildrenID description]
 * @return {[type]} [description]
 */
MySceneGraph.prototype.checkChildrenID= function() {
	for(var i = 0; i < this.components.length; i++){
		this.components[i].checkPrimitives(this.primitives);
	}

	var sceneExists = false;
	for(var i = 0; i < this.components.length; i++){
		this.components[i].checkComponents(this.components);
		if(this.components[i].getID() == this.root){
			sceneExists = true;
		}
	}
	if(!sceneExists){
		this.elementsErrors.push("Root component doesn't exist!!!")
	}
}

/**
 * [computeTransformation description]
 * @param  {[type]} type   [description]
 * @param  {[type]} matrix [description]
 * @param  {[type]} block  [description]
 * @return {[type]}        [description]
 */
MySceneGraph.prototype.computeTransformation=  function(type, matrix, block){
	var args = [];
	switch(type){
		case 'translate':{
			args = this.readValues(['x', 'y', 'z'], block)
			var translation = vec3.create();
			vec3.set (translation, args.x, args.y, args.z);
			mat4.translate(matrix, matrix, translation);
			break;
		}
		case 'rotate':{
			var axis = this.reader.getString(block, 'axis');
			var angle = this.reader.getFloat(block, 'angle');
			angle=this.toRadians(angle);
			switch(axis){
				case 'x': mat4.rotateX(matrix, matrix, angle); break;
				case 'y': mat4.rotateY(matrix, matrix, angle); break;
				case 'z': mat4.rotateZ(matrix, matrix, angle); break;
			}
			break;
		}
		case 'scale':{
			args = this.readValues(['x', 'y', 'z'], block)
			var scale = vec3.create();
			vec3.set(scale, args.x, args.y, args.z);
			mat4.scale(matrix, matrix, scale);
			break;
		}
		default:
		this.blockWarnings.push("Invalid transformation on block with id: " + id);
		break;
	}
	return matrix;
}

/**
 * [checkIfExists check if id exists in array]
 * @param  {[array]} array [array with elements]
 * @param  {[string]} id    [value to search]
 * @return {[int]}       [id index on array]
 */
MySceneGraph.prototype.checkIfExists =function(array, id){
	for(var j = 0; j < array.length; j++){
		if(id == array[j]["id"])
			return j;
	}
	return -1;
};

/**
 * [getRootComponent returns the root component]
 * @return {[Component]} [main component]
 */
MySceneGraph.prototype.getRootComponent =function(){
	for(var i = 0; i < this.components.length; i++){
		if(this.components[i].getID() == this.root){
			return this.components[i];
		}
	}
};


/**
 * [getDefaultView returns the default view]
 * @return {[CGFcamera]} [new default camera]
 */
MySceneGraph.prototype.getDefaultView=function() {
	for(view of this.views){
		if(view["id"] == this.defaultView){
			var fov = view["angle"];
			var near = view["near"];
			var far = view["far"];
			var position = view["from"];
			var target = view["to"];
			return new CGFcamera(fov, near, far, vec3.fromValues(position["x"], position["y"], position["z"]), 
									vec3.fromValues(target["x"], target["y"], target["z"]));
		}
	}
}

/**
 * [setNextView changes the default view to the next one on the list]
 */
MySceneGraph.prototype.setNextView=function() {
	for(var k = 0; k < this.views.length; k++){
		if(this.views[k]["id"] == this.defaultView){
			if(k + 1 == this.views.length)
				this.defaultView = this.views[0]["id"];
			else this.defaultView = this.views[k + 1]["id"];
			return;
		}
	}
}

/**
 * [getElements returns elements with name equal to tag]
 * @param  {[string]}  tag    [tag name]
 * @param  {[type]}  block  [information to read]
 * @param  {Boolean} isList [if true, more than one element can be found, otherwise, only one must be present]
 * @return {[string]}         [block of information with name tag]
 */
MySceneGraph.prototype.getElements= function(tag, block, isList){
	tagBlock = block.getElementsByTagName(tag);

	if(tagBlock == null){
			this.blockWarnings.push("no " + tag + " element found in" + block);
			return null;	
	}

	if(isList){
		if (tagBlock.length < 1){
			this.blockWarnings.push("no " + tag + " element found in " + block);
			return null;
		}
	} else{
		if(tagBlock.length != 1){
			this.blockWarnings.push("either zero or more than one " + tag + " element found " + block);
			return null;
		}
	}
	return tagBlock;
}

/**
 * [onXMLError sends a error message and finalizes the parser]
 * @param  {[string]} message [error message]
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+ message);
	this.loadedOk=false;
};

/**
 * [onXMLWarning sends a warning message]
 * @param  {[string]} message [message specification]
 */
MySceneGraph.prototype.onXMLWarning=function (message) {
	console.warn("XML Loading warning: "+ message);
};

/**
 * [readValues reads, from block, a list of values with description equal to list elements]
 * @param  {[array]} list  [values description]
 * @param  {[type]} block [block to read]
 * @return {[array]}       [value of each element]
 */
MySceneGraph.prototype.readValues= function(list, block){
	var values = [];
	for(var j = 0; j < list.length; j++){
		values[list[j]] = this.reader.getFloat(block, list[j]);
		this.checkFloatValue(values[list[j]], list[j]);
	}
	return values;
}

/**
 * [checkFloatValue verifies if the value is valid]
 * @param  {[type]} value [value to check]
 * @param  {[type]} name  [description of value]
 */
MySceneGraph.prototype.checkFloatValue= function(value, name){
	if(value == null){
		this.blockWarnings.push(name + " value is missing");
	} else if(isNaN(value)){
		this.blockWarnings.push(name + " value isn't a float");
	}
}

/**
 * [toRadians transforms a degree angle to a radian one]
 * @param  {[float]} degrees [value in degrees]
 * @return {[float]}         [value in radians]
 */
MySceneGraph.prototype.toRadians=function(degrees){
	return degrees*Math.PI/180;
}