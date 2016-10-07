
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
MySceneGraph.prototype.onXMLReady=function() 
{
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
				/*case 0:{
					this.parseGlobals(rootElement, elements);
					console.log('Scene name:', this.root);
					console.log('Axis length:', this.axisLength);
					break;
				}
				case 1:{
					this.parseViews(rootElement, elements); 
					console.log(this.views)
					break;
				} 
				case 2:{
					this.parseIllumination(rootElement, elements);
					console.log(this.illumination);
					break;
				}
				case 3:{
					this.parseLights(rootElement, elements); 
					console.log(this.omniLights);
					console.log(this.spotLights);
					break;
				}
				case 4:{
					this.parseTextures(rootElement, elements); 
					console.log(this.textures)
					break;
				} 
				case 5:{
					this.parseMaterials(rootElement, elements); 
					console.log(this.materials);
					break;
				}
				case 6:{
					this.parseTransformations(rootElement, elements); 
					console.log(this.transformations)
					break;
				} 
				case 7:{
					 this.parsePrimitives(rootElement, elements);
					 console.log(this.primitives);
					 break;
				}*/
				case 8: this.parseComponents(rootElement, elements); break;
				default: break;
			}
		} else skipBlock = 0;
	}
};


MySceneGraph.prototype.parseGlobals= function(rootElement, blockInfo) {
	var scene = blockInfo[0];
	this.root = this.reader.getString(scene, 'root');
	if(this.root == null){
		this.blockWarnings.push("Root object is missing");
	}

	this.axisLength = this.reader.getFloat(scene, 'axis_length');
	this.checkFloatValue(this.axisLength, 'Axis length');
};

MySceneGraph.prototype.parseViews= function(rootElement, blockInfo) {
	var viewsBlock = blockInfo[0];

	//VIEWS->PERSPECTIVE
	var perspBlock = this.getElements('perspective', viewsBlock, 1);
	if(perspBlock == null)
		return;

	for(var i=0; i < perspBlock.length; i++)
	{
		var viewsCounter = this.views.length;
		var perspective = perspBlock[i];

		var id = this.reader.getString(perspective, 'id');
		
		if(id == null){
			this.blockWarnings.push("Perspective ID is missing");
			break;
		}

		var idExists = false;
		for(var k = 0; k < this.views.length; k++){
			if(this.views[k]["id"] == id){
				this.blockWarnings.push("Perspective with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){

			this.views[viewsCounter] = [];
			this.views[viewsCounter]["id"] = id;

			this.views[viewsCounter]["near"] = this.reader.getFloat(perspective, 'near');
			this.checkFloatValue(this.views[viewsCounter]["near"], 'Near');
			this.views[viewsCounter]["far"] = this.reader.getFloat(perspective, 'far');
			this.checkFloatValue(this.views[viewsCounter]["far"], 'Far');
			this.views[viewsCounter]["angle"] = this.reader.getFloat(perspective, 'angle');
			this.checkFloatValue(this.views[viewsCounter]["angle"], 'Angle');

			//VIEWS->PERSPECTIVE->FROM
			var fromBlock = this.getElements('from', perspective, 0);
			if(fromBlock == null)
				return;

			this.views[viewsCounter]["from"] = this.readValues(['x', 'y', 'z'], fromBlock[0]);
			
			//VIEWS->PERSPECTIVE->TO
			var toBlock = this.getElements('to', perspective, 0);
			if(toBlock == null)
				return;
			
			this.views[viewsCounter]["to"] = this.readValues(['x', 'y', 'z'], toBlock[0]);
		}
	}

	this.defaultView = this.reader.getString(viewsBlock, 'default');
	if(this.defaultView == null){
		this.blockWarnings.push("Default View is missing");
	} else{
		var idFound = false;
		for(var k = 0; k < this.views.length; k++){
			if(this.views[k]["id"] == this.defaultView){
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

	//LIGHTS->OMNI
	for(var i=0; i < omniBlock.length; i++)
	{
		var omni = omniBlock[i];
		var omniCounter = this.omniLights.length;
		var id = this.reader.getString(omni, 'id');
		var idExists = false;

		for(var k = 0; k < this.omniLights.length; k++){
			if(this.omniLights[k]["id"] == id){
				this.blockWarnings.push("Omni light with id: " + id + " already exists");
				idExists = true;
			}
		}

		for(var k = 0; k < this.spotLights.length; k++){
			if(this.spotLights[k]["id"] == id){
				this.blockWarnings.push("Spot light with equal id as this omni light already exists");
				idExists = true;
			}
		}


		if(!idExists){
			this.omniLights[omniCounter] = [];
			this.omniLights[omniCounter]["id"] = id;
			this.omniLights[omniCounter]["enabled"] = this.reader.getBoolean(omni, 'enabled');

			//LIGHTS->OMNI->LOCATION
			var locationBlock = this.getElements('location', omni, 0);
			if(locationBlock == null)
				return;		

			this.omniLights[omniCounter]["location"] = [];
			this.omniLights[omniCounter]["location"] = this.readValues(['x', 'y', 'z', 'w'], locationBlock[0]);

			//LIGHTS->OMNI->AMBIENT
			var ambientBlock = this.getElements('ambient', omni, 0);
			if(ambientBlock == null)
				return;		

			this.omniLights[omniCounter]["ambient"] = [];
			this.omniLights[omniCounter]["ambient"] = this.readValues(['r', 'g', 'b', 'a'], ambientBlock[0]);

			//LIGHTS->OMNI->DIFFUSE
			var diffuseBlock = this.getElements('diffuse', omni, 0);
			if(diffuseBlock == null)
				return;		

			this.omniLights[omniCounter]["diffuse"] = [];
			this.omniLights[omniCounter]["diffuse"] = this.readValues(['r', 'g', 'b', 'a'], diffuseBlock[0]);

			//LIGHTS->OMNI->SPECULAR
			var specularBlock = this.getElements('specular', omni, 0);
			if(specularBlock == null)
				return;		

			this.omniLights[omniCounter]["specular"] = [];
			this.omniLights[omniCounter]["specular"] = this.readValues(['r', 'g', 'b', 'a'], specularBlock[0]);
		}
	}

	//LIGHTS->SPOT
	for(var i=0; i<spotBlock.length; i++)
	{
		var spot = spotBlock[i];
		var spotCounter = this.spotLights.length;
		var id = this.reader.getString(spot, 'id');
		var idExists = false;

		for(var k = 0; k < this.spotLights.length; k++){
			if(this.spotLights[k]["id"] == id){
				this.blockWarnings.push("Spot light with id: " + id + " already exists");
				idExists = true;
			}
		}

		for(var k = 0; k < this.omniLights.length; k++){
			if(this.omniLights[k]["id"] == id){
				this.blockWarnings.push("Omni light with equal id as this spot light already exists");
				idExists = true;
			}
		}

		if(!idExists){
			this.spotLights[spotCounter] = [];
			this.spotLights[spotCounter]["id"] = id;
			this.spotLights[spotCounter]["enabled"] = this.reader.getBoolean(spot, 'enabled');

			this.spotLights[spotCounter]["angle"] = this.reader.getFloat(spot, 'angle');
			this.checkFloatValue(this.spotLights[spotCounter]["angle"], 'Angle');

			this.spotLights[spotCounter]["exponent"] = this.reader.getFloat(spot, 'exponent');
			this.checkFloatValue(this.spotLights[spotCounter]["exponent"], 'Exponent');

			//LIGHTS->SPOT->TARGET
			var targetBlock = this.getElements('target', spot, 0);
			if(targetBlock == null)
				return;		

			this.spotLights[spotCounter]["target"] = [];
			this.spotLights[spotCounter]["target"] = this.readValues(['x', 'y', 'z'], targetBlock[0]);


			//LIGHTS->SPOT->LOCATION
			var locationBlock = this.getElements('location', spot, 0);
			if(locationBlock == null)
				return;		

			this.spotLights[spotCounter]["location"] = [];
			this.spotLights[spotCounter]["location"] = this.readValues(['x', 'y', 'z'], locationBlock[0]);

			//LIGHTS->SPOT->AMBIENT
			var ambientBlock = this.getElements('ambient', spot, 0);
			if(ambientBlock == null)
				return;		

			this.spotLights[spotCounter]["ambient"] = [];
			this.spotLights[spotCounter]["ambient"] = this.readValues(['r', 'g', 'b', 'a'], ambientBlock[0]);

			//LIGHTS->SPOT->DIFFUSE
			var diffuseBlock = this.getElements('diffuse', spot, 0);
			if(diffuseBlock == null)
				return;		

			this.spotLights[spotCounter]["diffuse"] = [];
			this.spotLights[spotCounter]["diffuse"] = this.readValues(['r', 'g', 'b', 'a'], diffuseBlock[0]);

			//LIGHTS->SPOT->SPECULAR
			var specularBlock = this.getElements('specular', spot, 0);
			if(specularBlock == null)
				return;		


			this.spotLights[spotCounter]["specular"] = [];
			this.spotLights[spotCounter]["specular"] = this.readValues(['r', 'g', 'b', 'a'], specularBlock[0]);
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
		var tCounter = this.textures.length; //valid texture tag counter
		var id = this.reader.getString(texture, 'id');
		var idExists = false;

		for(var k = 0; k < this.textures.length; k++){
			if(this.textures[k]["id"] == id){
				this.blockWarnings.push("Texture with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			this.textures[tCounter] = [];
			this.textures[tCounter]["id"] = id;
			this.textures[tCounter]["file"] = this.reader.getString(texture, 'file');
			this.textures[tCounter]["length_s"] = this.reader.getFloat(texture, 'length_s');
			this.checkFloatValue(this.textures[tCounter]["length_s"], 'Length_s');
			this.textures[tCounter]["length_t"] = this.reader.getFloat(texture, 'length_t');
			this.checkFloatValue(this.textures[tCounter]["length_t"], 'Length_t');
		}
	}
};

MySceneGraph.prototype.parseMaterials= function(rootElement, blockInfo) {
	var materialsBlock =  blockInfo[0];

	//Materials->Material
	var matBlock = this.getElements('material', materialsBlock, 1);
	if(matBlock == null)
		return;

	for(var i=0; i < matBlock.length; i++)
	{
		var material = matBlock[i];
		var mCounter = this.materials.length; //valid materials tag counter
		var id = this.reader.getString(material, 'id');
		var idExists = false;

		for(var k = 0; k < this.materials.length; k++){
			if(this.materials[k]["id"] == id){
				this.blockWarnings.push("Material with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			this.materials[mCounter] = [];
			this.materials[mCounter]["id"] = id;

			//MATERIALS->MATERIAL->EMISSION
			var emissionBlock = this.getElements('emission', material, 0);
			if(emissionBlock == null)
				return;

			this.materials[mCounter]["emission"] = [];
			this.materials[mCounter]["emission"] = this.readValues(['r', 'g', 'b', 'a'], emissionBlock[0]);

			//MATERIALS->MATERIAL->AMBIENT
			var ambientBlock = this.getElements('ambient', material, 0);
			if(ambientBlock == null)
				return;

			this.materials[mCounter]["ambient"] = [];
			this.materials[mCounter]["ambient"] = this.readValues(['r', 'g', 'b', 'a'], ambientBlock[0]);

			//MATERIALS->MATERIAL->DIFFUSE
			var diffuseBlock = this.getElements('diffuse', material, 0);
			if(diffuseBlock == null)
				return;		

			this.materials[mCounter]["diffuse"] = [];
			this.materials[mCounter]["diffuse"] = this.readValues(['r', 'g', 'b', 'a'], diffuseBlock[0]);

			//MATERIALS->MATERIAL->SPECULAR
			var specularBlock = this.getElements('specular', material, 0);
			if(specularBlock == null)
				return;		

			this.materials[mCounter]["specular"] = [];
			this.materials[mCounter]["specular"] = this.readValues(['r', 'g', 'b', 'a'], specularBlock[0]);

			//MATERIALS->MATERIAL->SHININESS
			var shininessBlock = this.getElements('shininess', material, 0);
			if(shininessBlock == null)
				return;

			this.materials[mCounter]["shininess"] = this.reader.getFloat(shininessBlock[0], 'value');
			this.checkFloatValue(this.materials[mCounter]["shininess"], "Shininess");
		}
	}
};

MySceneGraph.prototype.parseTransformations= function(rootElement, blockInfo) {
	var transformationsBlock = blockInfo[0];

	//Transformations->transformation
	var transBlock = this.getElements('transformation', transformationsBlock, 1);
	if(transBlock == null)
		return;

	for(var i=0; i < transBlock.length; i++)
	{
		var transformation = transBlock[i];
		var tCount = this.transformations.length; //valid transformation tag counter
		var id = this.reader.getString(transformation, 'id');
		var idExists = false;

		for(var k = 0; k < this.transformations.length; k++){
			if(this.transformations[k]["id"] == id){
				this.blockWarnings.push("Transformation with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			var matrix = mat4.create();
			matrix = mat4.identity(matrix);

			this.transformations[tCount] = [];
			this.transformations[tCount]["id"] = id;

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
			this.transformations[tCount]["matrix"] = matrix;
		}
	}
};

MySceneGraph.prototype.parsePrimitives= function(rootElement, blockInfo) {
	var primitivesBlock = blockInfo[0];

	//Primitives->primitive
	var primBlock = this.getElements('primitive', primitivesBlock, 1);
	if(primBlock == null)
		return;

	for(var i=0; i < primBlock.length; i++)
	{
		var primitive = primBlock[i];
		var pCount = this.primitives.length; //valid primitive tag counter
		var id = this.reader.getString(primitive, 'id');
		var idExists = false;

		for(var k = 0; k < this.primitives.length; k++){
			if(this.primitives[k]["id"] == id){
				this.blockWarnings.push("Primitive with id: " + id + " already exists");
				idExists = true;
			}
		}

		if(!idExists){
			this.primitives[pCount] = [];
			this.primitives[pCount]["id"] = id;

			var nPrimitives = primitive.children.length;
			if(nPrimitives > 1){
				this.blockWarnings.push("More than one type of primitive per block");
			} else{
				var tagName = primitive.children[0].tagName;
				switch(tagName){
					case 'rectangle':{
						this.primitives[pCount][tagName] = this.readValues(['x1', 'y1', 'x2', 'y2'], primitive.children[0])
						break;
					}
					case 'triangle':{
						this.primitives[pCount][tagName] = this.readValues(['x1', 'y1', 'z1', 'x2', 'y2', 'z2','x3', 'y3', 'z3'], primitive.children[0])
						break;
					}
					default: break;
				}
			}
		}
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
			this.components[compCounter]=[];
			this.components[compCounter]["id"]=id;


			//COMPONENTS->COMPONENT->TRANSFORMATION
			var transformationBlock = this.getElements('transformation',componentBlock[0] ,0);
			if(transformationBlock==null)
				return;
			this.components[compCounter]["transformation"]=[];

			//COMPONENTS->COMPONENT->TRANSFORMATION->TRANSFORMATIONREF
			var transformationRefBlock=this.getElements('transformationref',transformationBlock[0], 0);
			if(transformationRefBlock==null)
				return;
			this.components[compCounter]["transformation"]["transformationref"]=[];
			this.components[compCounter]["transformation"]["transformationref"]["id"]=this.reader.getString(transformationRefBlock[0],'id');

			//COMPONENTS->COMPONENT->TRANSFORMATION->TRANSLATE
			var translateBlock=this.getElements('translate',transformationBlock[0], 0);
			if(translateBlock==null)
				return;
			this.components[compCounter]["transformation"]["translate"]=[];
			this.components[compCounter]["transformation"]["translate"]=this.readValues(['x','y','z'],translateBlock[0]);


			//COMPONENTS->COMPONENT->TRANSFORMATION->ROTATE
			var rotateBlock=this.getElements('rotate',transformationBlock[0], 0);
			if(rotateBlock==null)
				return;
			this.components[compCounter]["transformation"]["rotate"]=[];
			this.components[compCounter]["transformation"]["rotate"]=this.readValues(['axis','angle'],rotateBlock[0]);

			//COMPONENTS->COMPONENT->TRANSFORMATION->SCALE
			var scaleBlock=this.getElements('scale',transformationBlock[0], 0);
			if(scaleBlock==null)
				return;
			this.components[compCounter]["transformation"]["scale"]=[];
			this.components[compCounter]["transformation"]["scale"]=this.readValues(['x','y','z'],scaleBlock[0]);


			//COMPONENTS->COMPONENT->MATERIALS
			var materialsBlock = this.getElements('materials', componentBlock[0], 0);
			if(materialsBlock==null)
				return;
			
			//COMPONENTS->COMPONENT->MATERIALS->MATERIAL
			var materialBlock = this.getElements('material',materialsBlock[0],1);
			if(materialBlock==null)
				return;

			this.components[compCounter]["materials"]=[];
			for(var j=0; j<materialBlock.length; j++){
				var material = materialBlock[j];
				var matCounter=this.components[compCounter]["materials"].length;
				var id = this.reader.getString(material, 'id');
				var idExists=false;

				for(var k=0; k<matCounter; k++){
					if(this.components[compCounter]["materials"][k]==id){
						this.blockWarnings.push("Material with id: "+id+" already exists in this component.");
						idExists=true;
					}
				}

				if(!idExists){
					this.components[compCounter]["materials"][matCounter]=id;
				}
			}

			//COMPONENTS->COMPONENT->TEXTURE
			var textureBlock = this.getElements('texture', componentBlock[0], 0);
			if(textureBlock==null)
				return;
			this.components[compCounter]["texture"]=this.reader.getString(textureBlock[0],'id');


			//COMPONENTS->COMPONENT->CHILDREN
			var childrenBlock = this.getElements('children', componentBlock[0], 0);
			if(childrenBlock==null)
				return;
			this.components[compCounter]["children"]=[];

			//COMPONENTS->COMPONENT->CHILDREN->COMPONENTREF
			var compRefBlock = this.getElements('componentref', childrenBlock[0],1);
			if(compRefBlock==null)
				return;

			this.components[compCounter]["children"]["componentref"]=[];
			for(var j=0; j<compRefBlock.length; j++){
				var compRef = compRefBlock[j];
				var compRefCounter=this.components[compCounter]["children"]["componentref"].length;
				var id = this.reader.getString(compRef, 'id');
				var idExists=false;

				for(var k=0; k<compRefCounter; k++){
					if(this.components[compCounter]["children"]["componentref"][k]==id){
						this.blockWarnings.push("Componentref with id: "+id+" already exists in this component.");
						idExists=true;
					}
				}

				if(!idExists){
					this.components[compCounter]["children"]["componentref"][compRefCounter]=id;
				}
			}

			//COMPONENTS->COMPONENT->CHILDREN->PRIMITIVEREF
			var primRefBlock = this.getElements('primitiveref', childrenBlock[0],1);
			if(primRefBlock==null)
				return;

			this.components[compCounter]["children"]["primitiveref"]=[];
			for(var j=0; j<primRefBlock.length; j++){
				var primRef = primRefBlock[j];
				var primRefCounter=this.components[compCounter]["children"]["primitiveref"].length;
				var id = this.reader.getString(primRef, 'id');
				var idExists=false;

				for(var k=0; k<primRefCounter; k++){
					if(this.components[compCounter]["children"]["primitiveref"][k]==id){
						this.blockWarnings.push("Primitiveref with id: "+id+" already exists in this component.");
						idExists=true;
					}
				}

				if(!idExists){
					this.components[compCounter]["children"]["primitiveref"][compRefCounter]=id;
				}
			}

		}
		console.log(this.components);

	}

	
};

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

/*
	Auxiliar functions
*/

MySceneGraph.prototype.readValues= function(list, block){
	var values = [];
	for(var j = 0; j < list.length; j++){
		values[list[j]] = this.reader.getFloat(block, list[j]);
		this.checkFloatValue(values[list[j]], list[j]);
	}
	return values;
}


MySceneGraph.prototype.checkFloatValue= function(value, name){
	if(value == null){
		this.blockWarnings.push(name + " value is missing");
	} else if(isNaN(value)){
		this.blockWarnings.push(name + " value isn't a float");
	}
}
