/**
 * Cylinder
 * @constructor
 */
 function Cylinder(scene, slices, stacks) {
 	CGFobject.call(this,scene);
	
	this.slices = slices;
	this.stacks = stacks;

 	this.initBuffers();
 };

Cylinder.prototype = Object.create(CGFobject.prototype);
Cylinder.prototype.constructor = Cylinder;

 Cylinder.prototype.initBuffers = function() {
 	
	this.vertices = [];
	this.normals = [];
	this.indices = [];
	this.texCoords = [];
 	var ang = Math.PI*2/this.slices;
 	var x, y;
 	var counter = 0;

	for(var i = 0; i <= this.stacks; i++){

		for(var j = 0; j <= this.slices; j++){
			//posição x e y dos dois vértices de uma mesma face
			x = Math.cos(j * ang); 
			y = Math.sin(j * ang);

			this.vertices.push(x, y, i / this.stacks);
			this.normals.push(x, y, 0);
			this.texCoords.push(j / this.slices, i / this.stacks); 
			counter++;	
		}
	}

	for(var i = 1; i <= this.stacks; i++){
 		for(var j = 1; j <= this.slices; j++)
 		{
			var stack1 = (this.slices+1) * (i - 1) + (this.slices - j);
			var stack2 = (this.slices+1) * i + (this.slices - j);

			this.indices.push(stack1, stack1 + 1, stack2+1);
			this.indices.push(stack2+1, stack2, stack1);
 		} 
	}

	this.vertices.push(0, 0, 0);
	this.normals.push(0, 0, 1);
	this.texCoords.push(0.5, 0.5);

	for(var i = 0; i < this.slices; i++){
		this.indices.push(i, counter, i + 1);
	}

	this.vertices.push(0, 0, 1);
	this.normals.push(0, 0, 1);
	this.texCoords.push(0.5, 0.5);
 	
	for(var i = 0; i < this.slices; i++){
		this.indices.push(counter - 1 - this.slices + i, counter - this.slices + i, counter + 1);
	}


 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };