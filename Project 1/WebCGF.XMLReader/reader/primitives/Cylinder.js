/**
 * Cylinder
 * @constructor
 */
 function Cylinder(scene, base, top, height, slices, stacks) {
 	CGFobject.call(this,scene);
	
	this.slices = slices;
	this.base = base;
	this.top = top;
	this.height = height;
	this.stacks = stacks;
	this.bottomCircle = new Circle(this.scene, this.base, this.slices);
	this.topCircle = new Circle(this.scene, this.top, this.slices);

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
 	var radiusInc = (this.top - this.base)/this.stacks;
 	var x, y;
 	var counter = 0;

	for(var i = 0; i <= this.stacks; i++){

		for(var j = 0; j <= this.slices; j++){
			//posição x e y dos dois vértices de uma mesma face
			x = (this.base + i * radiusInc)*Math.cos(j * ang); 
			y = (this.base + i * radiusInc)*Math.sin(j * ang);

			this.vertices.push(x, y, this.height*i/this.stacks);
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
 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

 Cylinder.prototype.display = function() {
    CGFobject.prototype.display.call(this);
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 1, 0, 0)
    this.bottomCircle.display();
    this.scene.translate(0, 0, -this.height);
    this.scene.rotate(Math.PI, 1, 0, 0)
    this.scene.rotate(Math.PI, 0, 0, 1)
    this.topCircle.display();
    this.scene.popMatrix();
};