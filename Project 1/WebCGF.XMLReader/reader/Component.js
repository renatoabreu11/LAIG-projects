/**
 * Component
 * @constructor
 */
function Component(scene, id) {
 	CGFobject.call(this,scene);
 	this.scene = scene;
 	this.id = id;

 	this.isChecked=false;
 	
 	this.transformation = null;
 	this.finalTransformation=null;
 	this.materials = null;
 	this.materialIndex = 0;
 	this.texture = null;

 	this.children = {'components': [], 'primitives': []};
 };

 Component.prototype = Object.create(CGFobject.prototype);
 Component.prototype.constructor = Component;

Component.prototype.getID= function() {
 	return this.id;
}

Component.prototype.setTransformation= function(transformation) {
 	this.transformation = transformation;
 	this.finalTransformation = transformation;
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


