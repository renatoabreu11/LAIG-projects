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
    this.animations = [];
    this.animationIndex = -1;
    this.animationTimer = 0;

 	//this contains all the ids 
 	this.componentsID = [];
 	this.primitivesID = [];

 	//here, only the children with valid ids
 	this.children = {'components': [], 'primitives': []};
 };

 Component.prototype = Object.create(CGFobject.prototype);
 Component.prototype.constructor = Component;

/**
 * Returns the component ID
 * @return {[int]} id
 */
 Component.prototype.getID= function() {
 	return this.id;
 }

/**
 * [getTransformation description]
 * @return {[type]} [description]
 */
 Component.prototype.getTransformation= function() {
 	return this.transformation;
 }

/**
 * Sets the transformation matrix
 * @param {[mat4 matrix]} new matrix
 */
 Component.prototype.setTransformation= function(transformation) {
 	this.transformation = transformation;
 }

/**
 * Adds a material to the list of materials
 * @param {[array]} material object
 */
 Component.prototype.addMaterial= function(material) {
 	this.materials.push(material);
 }

/**
 * Adds an animation to the list of animations
 * @param {[array]} animation object
 */
Component.prototype.addAnimation = function (animation) {
    this.animationIndex = 0;
    this.animations.push(animation);
}

/**
 * Returns the current animation being executed
 */
Component.prototype.getAnimation = function () {
    if (this.animationIndex == -1) {
        return null;
    } else {
        return this.animations[this.animationIndex];
    }
}

/**
 * Adds a valid child component
 * @param {[Component]} child component
 */
 Component.prototype.addChildComponent= function(child) {
 	this.children["components"].push(child);
 }

/**
 * Adds a valid child primitive
 * @param {[Primitive]} child primitive
 */
 Component.prototype.addChildPrimitive= function(child) {
 	this.children["primitives"].push(child);
 }

/**
 * Sets component actual texture
 * @param {[Texture]} new texture
 */
 Component.prototype.setTexture= function(texture) {
 	this.texture = texture;
 }

/**
 * Adds a new component ID, valid or not.
 * @param {[int]} component id
 */
 Component.prototype.addComponentID= function(id) {
 	this.componentsID.push(id);
 }

/**
 * Adds a new primitve ID, valid or not.
 * @param {[int]} primitve id
 */
 Component.prototype.addPrimitiveID= function(id) {
 	this.primitivesID.push(id);
 }

/**
 * Checks the primitvesID and verifies if the elements are valid, if so, then the primitive is initialized
 * @param  {[array]} array with all the primitives
 */
 Component.prototype.checkPrimitives= function(primitives){
 	for(var i = 0; i < this.primitivesID.length; i++){
 		var index = this.checkIfExists(primitives, this.primitivesID[i]);
 		if(index >= 0){
 			this.addChildPrimitive(primitives[index]["object"]);
 		}else{
 			console.warn("XML Loading warning: PrimitiveRef " + this.primitivesID[i] + " doesn't exist");
 		}
 	}
 }


/**
 * Checks the componentsID array and verifies if the elements are valid, if so, then the component is added
 * @param  {[array]} array with all the components
 */
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

/**
 * Changes current material to the next on the materials list
 */
 Component.prototype.nextMaterial= function(){
 	this.materialIndex++;
 	if(this.materialIndex >= this.materials.length){
 		this.materialIndex = 0;
 	}
 }

/**
 * Check if id exists in array
 * @param  {[array]} array with elements
 * @param  {[string]} value to search
 * @return {[int]} id index on array
 */
 Component.prototype.checkIfExists =function(array, id){
 	for(var j = 0; j < array.length; j++){
 		if(id == array[j]["id"])
 			return j;
 	}
 	return -1;
 };

Component.prototype.updateAnimations= function(elapsedTime){
    var initTime = 0;
    var endTime = 0;
    for(var i = 0; i < this.animations.length; i++){
        endTime += this.animations[i].getSpan();

        if(elapsedTime <= endTime && elapsedTime >= initTime){
            this.animationIndex = i;
            break;
        }

        initTime = endTime;
    }

    this.animationTimer = initTime;

    if(elapsedTime > endTime)
        this.animationIndex = -1;
}

/**
 * This function applies the transformation the respective component and all of its children.
 * Then inherit the father material and/or texture if that's the case. 
 * After this the appearance with the right texutre and material is applied.
 * Then, each child primitve is displayed as well each child component.
 * By iterating each children components and starting with the root component, this function goes through 
 * the scene graph and displays each object.
 * @param  {[Texture]} component father texture
 * @param  {[Material]} component father material
 */
Component.prototype.display= function(fatherTex, fatherMat, elapsedTime){
    this.scene.pushMatrix();
    this.scene.multMatrix(this.transformation);

    this.updateAnimations(elapsedTime);
    for(var i = 0; i < this.animations.length; i++){
        if(i > this.animationIndex && this.animationIndex != -1)
            break;
        var time;
        if(i != this.animationIndex)
            time = this.animations[i].getSpan();
        else time = elapsedTime - this.animationTimer;
        var matrix = this.animations[i].getMatrix(time);
        this.scene.multMatrix(matrix);
    }

    var compTexture = this.texture;
    var compMaterial = this.materials[this.materialIndex];

    if(compMaterial["id"] == 'inherit'){
        compMaterial = fatherMat;
    }

    var appearance = compMaterial;
 	if(this.texture["id"] == 'inherit'){
 		if(fatherTex["id"] != 'none'){
 			appearance["appear"].setTexture(fatherTex["info"]);
 		} else appearance["appear"].setTexture(null);
 		compTexture = fatherTex;
 	}else if(this.texture["id"] != 'none' && this.texture != null){
 		appearance["appear"].setTexture(this.texture["info"]);
 	}

 	if(this.texture["id"] == 'none')
 		appearance["appear"].setTexture(null);

 	appearance["appear"].apply();
    
    for(var i = 0; i < this.children["primitives"].length; i++){
 		var prim = this.children["primitives"][i];
 		if(compTexture != 'none'){
 			prim.updateTexCoords(compTexture["length_s"], compTexture["length_t"]);
 		}
        if (prim instanceof Portal) {
            prim.updateTime(elapsedTime);
        }
 		prim.display();
 	}

 	for(var i = 0; i < this.children["components"].length; i++){
 		var comp = this.children["components"][i];
 		comp.display(compTexture, compMaterial, elapsedTime);
 	}
 	this.scene.popMatrix();
 }
