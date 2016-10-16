/**
 * Component
 * @constructor
 */
function Component(scene, id) {
 	CGFobject.call(this,scene);
 	this.scene = scene;
 	this.id = id;

 	this.transformation = null;
 	this.materials = [];
 	this.materialIndex = 0;
 	this.texture = null;

 	//this contains all the ids 
 	this.componentsID = [];
 	this.primitivesID = [];

 	//here, only the children with valid ids
 	this.children = {'components': [], 'primitives': []};
 };

 Component.prototype = Object.create(CGFobject.prototype);
 Component.prototype.constructor = Component;

Component.prototype.getID= function() {
 	return this.id;
}

Component.prototype.getTransformation= function() {
 	return this.transformation;
}

Component.prototype.setTransformation= function(transformation) {
 	this.transformation = transformation;
}

Component.prototype.addMaterial= function(material) {
 	this.materials.push(material);
}

Component.prototype.addChildComponent= function(child) {
 	this.children["components"].push(child);
}

Component.prototype.addChildPrimitive= function(child) {
 	this.children["primitives"].push(child);
}

Component.prototype.setTexture= function(texture) {
 	this.texture = texture;
}

Component.prototype.addComponentID= function(id) {
 	this.componentsID.push(id);
}

Component.prototype.addPrimitiveID= function(id) {
 	this.primitivesID.push(id);
}

Component.prototype.checkPrimitives= function(primitives){
	for(var i = 0; i < this.primitivesID.length; i++){
		var index = this.checkIfExists(primitives, this.primitivesID[i]);
		if(index >= 0){
			this.initPrimitive(primitives[index]);
		}else{
			console.warn("XML Loading warning: PrimitiveRef " + this.primitivesID[i] + " doesn't exist");
		}
	}
}

Component.prototype.initPrimitive =function(primitive){
	switch(primitive['tag']){
		case 'rectangle':
			var values = primitive['rectangle'];
			this.children["primitives"].push(new Rectangle(this.scene,values['x1'],values['y1'],values['x2'],values['y2']));
			break;
		case 'triangle':
			var values = primitive['triangle'];
			this.children["primitives"].push(new Triangle(this.scene,values['x1'],values['y1'],values['z1'],values['x2'],values['y2'],values['z2'],values['x3'],values['y3'],values['z3']));
			break;
		case 'cylinder':
			var values = primitive['cylinder'];
			this.children["primitives"].push(new Cylinder(this.scene,values['slices'],values['stacks']));
			break;
		case 'sphere':
			var values = primitive['sphere'];
			this.children["primitives"].push(new Sphere(this.scene, values['radius'], values['slices'],values['stacks']));
			break;
		case 'torus':
			var values = primitive['torus'];
			this.children["primitives"].push(new Torus(this.scene, values['inner'], values['outer'], values['slices'],values['loops']));
			break;
	}
};

Component.prototype.checkComponents= function(components){
	for(var i = 0; i < this.componentsID.length; i++){
		if(this.componentsID[i] == this.id){
			console.warn("XML Loading warning: Component with + id " + this.id + " cannot be a child of itself");
		}else{
			for(var j = 0; j < components.length; j++){
				var index = -1;
				if(this.componentsID[i] == components[j].getID()){
					index = j;
					this.children["components"].push(components[j]);
				}
			}
		}
	}
}

/*
 * Check if the element with id exists in th array passed as arg
 */
Component.prototype.checkIfExists =function(array, id){
	for(var j = 0; j < array.length; j++){
		if(id == array[j]["id"])
			return j;
	}
	return -1;
};

Component.prototype.display= function(fatherTex){
	this.scene.pushMatrix();
	this.scene.multMatrix(this.transformation);

	var compTex = this.texture;

	if(this.texture["id"] == 'inherit'){
		if(fatherTex["id"] == 'none')
			this.scene.materialDefault.apply();
		else fatherTex["appear"].apply();
		compTex = fatherTex;
	}else if(this.texture["id"] == 'none'){
		this.scene.materialDefault.apply();
	}else if(this.texture != null){
		this.texture["appear"].apply();
	}

	for(var i = 0; i < this.children["primitives"].length; i++){
		var prim = this.children["primitives"][i];
		prim.display();
	}


	for(var i = 0; i < this.children["components"].length; i++){
		var comp = this.children["components"][i];
		comp.display(compTex);
	}
	this.scene.popMatrix();
}
