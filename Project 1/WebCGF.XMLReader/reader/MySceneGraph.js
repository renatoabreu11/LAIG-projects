
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

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() {
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Call to the function that receives the root element and the list of blocks. This function calls the respective function to each block.
	var blocks = ['scene', 'views', 'illumination', 'lights', 'textures', 'materials', 'transformations', 'primitives', 'components'];
	this.parseBlocks(rootElement, blocks);

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

/*
 * Method that search for each block in the blocksTag list and than calls the function to parse its elements
 */
MySceneGraph.prototype.parseBlocks= function(rootElement, blocksTag) {
	var skipBlock = 0;

	//não esquecer de verificar as ordens da tag!!
	for(var i = 0; i < blocksTag.length; i++){
		var elements =  rootElement.getElementsByTagName(blocksTag[i]);
		if (elements == null) {
			this.elementsErrors.push(blocksTag[i] + " element is missing.");
			skipBlock = 1;
		}
		//do not forget to remove the last condition!!!!!!!!!!!!!!!
		if (elements.length != 1 && skipBlock == 0 && blocksTag[i] != "materials") {
			this.elementsErrors.push("either zero or more than one " + blocksTag[i] + " element found.");
			skipBlock = 1;
		}

		if(skipBlock == 0){
			switch(i){
				case 0:{
					this.parseGlobals(rootElement, elements); break;
				}
				case 1:{
					this.parseViews(rootElement, elements); break;
				} 
				case 2:{
					this.parseIllumination(rootElement, elements); break;
				}
				case 3:{
					this.parseLights(rootElement, elements);  break;
				}
				case 4:{
					this.parseTextures(rootElement, elements); break;
				} 
				case 5:{
					this.parseMaterials(rootElement, elements); break;
				}
				case 6:{
					this.parseTransformations(rootElement, elements); break;
				} 
				case 7:{
					 this.parsePrimitives(rootElement, elements); break;
				}
				case 8: //this.parseComponents(rootElement, elements); 
					break;
				default:{
					break;
				} 
			}
		} else skipBlock = 0;
	}
};

/*
 * Method that parses the global values, root name and axis length
 */
MySceneGraph.prototype.parseGlobals= function(rootElement, blockInfo) {
	var scene = blockInfo[0];
	this.root = this.reader.getString(scene, 'root');
	if(this.root == null){
		this.elementsErrors.push("Root object is missing");
	}

	this.axisLength = this.reader.getFloat(scene, 'axis_length');
	this.checkFloatValue(this.axisLength, 'Axis length');
};

/*
 * This method parses all the declared views and all of its elements
 */ 
MySceneGraph.prototype.parseViews= function(rootElement, blockInfo) {
	var viewsBlock = blockInfo[0];

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
			view["angle"] *= Math.PI/180;

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

/*
 * Parses the illumination values
 */
MySceneGraph.prototype.parseIllumination= function(rootElement, blockInfo) {
	var illuminationBlock = blockInfo[0];

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

/*
 * Method that verifies the light block and calls the respective function to par
 * parse the light, accordingly to its type
 */
MySceneGraph.prototype.parseLights= function(rootElement, blockInfo) {
	//LIGHTS
	var lightsBlock = blockInfo[0];
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

/*
 * Parses omni lights
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

/*
 * Parses spot lights
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
		light["angle"] *= Math.PI/180;

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

/*
 * Textures tag parser
 */
MySceneGraph.prototype.parseTextures= function(rootElement, blockInfo) {
	var texturesBlock = blockInfo[0];

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
			this.textures.push(tex);
		}
	}
};

/*
 * This function parses material block 
 */
MySceneGraph.prototype.parseMaterials= function(rootElement, blockInfo) {
	var materialsBlock =  blockInfo[0];

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

			this.materials[id] = appearance;
		}
	}
};

/*
 * Parses the transformation info (scale, rotation, translate) applying
 * the transormation to a indentity matrix. Then saves the matrix in the array
 */
MySceneGraph.prototype.parseTransformations= function(rootElement, blockInfo) {
	var transformationsBlock = blockInfo[0];

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
					switch(tagName){
						case 'translate':{
							args = this.readValues(['x', 'y', 'z'], transformation.children[j])
							var translation = vec3.create();
							vec3.set (translation, args.x, args.y, args.z);
							mat4.translate(matrix, matrix, translation);
							break;
						}
						case 'rotate':{
							var axis = this.reader.getString(transformation.children[j], 'axis');
							var angle = this.reader.getFloat(transformation.children[j], 'angle');
							switch(axis){
								case 'x': mat4.rotateX(matrix, matrix, angle); break;
								case 'y': mat4.rotateY(matrix, matrix, angle); break;
								case 'z': mat4.rotateZ(matrix, matrix, angle); break;
							}
							break;
						}
						case 'scale':{
							args = this.readValues(['x', 'y', 'z'], transformation.children[j])
							var scale = vec3.create();
							vec3.set(scale, args.x, args.y, args.z);
							mat4.scale(matrix, matrix, scale);
							break;
						}
						default:
							this.blockWarnings.push("Invalid transformation on block with id: " + id);
							break;
					}
				}
			}
			transf["matrix"] = matrix;
			this.transformations.push(transf);
		}
	}
};

/*
 * Parses primitive of each type (rectangle, triangle, cylinder, sphere and torus)
 */ 
MySceneGraph.prototype.parsePrimitives= function(rootElement, blockInfo) {
	var primitivesBlock = blockInfo[0];

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

MySceneGraph.prototype.parseComponents= function(rootElement, blockInfo) {
	//COMPONENTS
	var componentsBlock = blockInfo[0];

	var componentBlock = this.getElements('component', componentsBlock, 1);
	if(componentBlock==null)
		return;

	//COMPONENTS->COMPONENT
	for(var i=0; i<componentBlock.length; i++)
	{
		var component = componentBlock[i];
		var compCounter = this.components.length;
		var id = this.reader.getString(component, 'id');
		var idExists = false;

		for(var j=0; j<compCounter; j++) {
			if(this.components[j]["id"] == id) {
				this.blockWarnings.push("Component with id: "+id+" already exists.");
				idExists=true;
			}
		}

		if(!idExists) {
			this.components[id]=[];
			this.components[id]["id"]=id;


			//COMPONENTS->COMPONENT->TRANSFORMATION
			var transformationBlock = this.getElements('transformation',componentBlock[0] ,0);
			if(transformationBlock==null)
				return;
			this.components[id]["transformation"]=[];

			//COMPONENTS->COMPONENT->TRANSFORMATION->TRANSFORMATIONREF
			var transformationRefBlock=this.getElements('transformationref',transformationBlock[0], 0);
			if(transformationRefBlock==null)
				return;
			this.components[id]["transformation"]["transformationref"]=[];
			this.components[id]["transformation"]["transformationref"]["id"]=this.reader.getString(transformationRefBlock[0],'id');

			//COMPONENTS->COMPONENT->TRANSFORMATION->TRANSLATE
			var translateBlock=this.getElements('translate',transformationBlock[0], 0);
			if(translateBlock==null)
				return;
			this.components[id]["transformation"]["translate"]=[];
			this.components[id]["transformation"]["translate"]=this.readValues(['x','y','z'],translateBlock[0]);


			//COMPONENTS->COMPONENT->TRANSFORMATION->ROTATE
			var rotateBlock=this.getElements('rotate',transformationBlock[0], 0);
			if(rotateBlock==null)
				return;
			this.components[id]["transformation"]["rotate"]=[];
			this.components[id]["transformation"]["rotate"]=this.readValues(['axis','angle'],rotateBlock[0]);

			//COMPONENTS->COMPONENT->TRANSFORMATION->SCALE
			var scaleBlock=this.getElements('scale',transformationBlock[0], 0);
			if(scaleBlock==null)
				return;
			this.components[id]["transformation"]["scale"]=[];
			this.components[id]["transformation"]["scale"]=this.readValues(['x','y','z'],scaleBlock[0]);


			//COMPONENTS->COMPONENT->MATERIALS
			var materialsBlock = this.getElements('materials', componentBlock[0], 0);
			if(materialsBlock==null)
				return;
			
			//COMPONENTS->COMPONENT->MATERIALS->MATERIAL
			var materialBlock = this.getElements('material',materialsBlock[0],1);
			if(materialBlock==null)
				return;

			this.components[id]["materials"]=[];
			for(var j=0; j<materialBlock.length; j++){
				var material = materialBlock[j];
				var matCounter=this.components[id]["materials"].length;
				var id = this.reader.getString(material, 'id');
				var idExists=false;

				for(var k=0; k<matCounter; k++){
					if(this.components[id]["materials"][k]==id){
						this.blockWarnings.push("Material with id: "+id+" already exists in this component.");
						idExists=true;
					}
				}
/*
				if(!idExists){
					this.components[id]["materials"][matCounter]=id;
				}*/
			}

			//COMPONENTS->COMPONENT->TEXTURE
			var textureBlock = this.getElements('texture', componentBlock[0], 0);
			if(textureBlock==null)
				return;
			this.components[id]["texture"]=this.reader.getString(textureBlock[0],'id');


			//COMPONENTS->COMPONENT->CHILDREN
			var childrenBlock = this.getElements('children', componentBlock[0], 0);
			if(childrenBlock==null)
				return;
			this.components[id]["children"]=[];

			//COMPONENTS->COMPONENT->CHILDREN->COMPONENTREF
			var compRefBlock = this.getElements('componentref', childrenBlock[0],1);
			if(compRefBlock==null)
				return;

			this.components[id]["children"]["componentref"]=[];
			for(var j=0; j<compRefBlock.length; j++){
				var compRef = compRefBlock[j];
				var compRefCounter=this.components[id]["children"]["componentref"].length;
				var id = this.reader.getString(compRef, 'id');
				var idExists=false;

				for(var k=0; k<compRefCounter; k++){
					if(this.components[id]["children"]["componentref"][k]==id){
						this.blockWarnings.push("Componentref with id: "+id+" already exists in this component.");
						idExists=true;
					}
				}

				if(!idExists){
					this.components[id]["children"]["componentref"][compRefCounter]=id;
				}
			}

			//COMPONENTS->COMPONENT->CHILDREN->PRIMITIVEREF
			var primRefBlock = this.getElements('primitiveref', childrenBlock[0],1);
			if(primRefBlock==null)
				return;

			this.components[id]["children"]["primitiveref"]=[];
			for(var j=0; j<primRefBlock.length; j++){
				var primRef = primRefBlock[j];
				var primRefCounter=this.components[id]["children"]["primitiveref"].length;
				var id = this.reader.getString(primRef, 'id');
				var idExists=false;

				for(var k=0; k<primRefCounter; k++){
					if(this.components[id]["children"]["primitiveref"][k]==id){
						this.blockWarnings.push("Primitiveref with id: "+id+" already exists in this component.");
						idExists=true;
					}
				}

				if(!idExists){
					this.components[id]["children"]["primitiveref"][compRefCounter]=id;
				}
			}
		}
		console.log(this.components);

	}
};

/*
 * Returns the view selected as default
 */
MySceneGraph.prototype.getDefaultView=function() 
{
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

/*
 * The default view changes to the next on the list
 */
MySceneGraph.prototype.setNextView=function() 
{
	for(var k = 0; k < this.views.length; k++){
		if(this.views[k]["id"] == this.defaultView){
			if(k + 1 == this.views.length)
				this.defaultView = this.views[0]["id"];
			else this.defaultView = this.views[k + 1]["id"];
			return;
		}
	}
}

//@param isList -> if the block to inspect can have more than one element than we just need to check if the number
//of tags is less than 1
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

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+ message);
	this.loadedOk=false;
};

/*
 * Callback to be executed on any missing value or block element
 */
MySceneGraph.prototype.onXMLWarning=function (message) {
	console.warn("XML Loading warning: "+ message);
};

/********************** Auxiliar functions **********************************/

/*
	This function receives a list of parameters and a block of information. Then it reads the respectives elements from the block
*/
MySceneGraph.prototype.readValues= function(list, block){
	var values = [];
	for(var j = 0; j < list.length; j++){
		values[list[j]] = this.reader.getFloat(block, list[j]);
		this.checkFloatValue(values[list[j]], list[j]);
	}
	return values;
}

/*
	Checks if the float passed as arg is valid
*/
MySceneGraph.prototype.checkFloatValue= function(value, name){
	if(value == null){
		this.blockWarnings.push(name + " value is missing");
	} else if(isNaN(value)){
		this.blockWarnings.push(name + " value isn't a float");
	}
}
