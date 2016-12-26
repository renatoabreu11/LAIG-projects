function Node(scene){
	CGFobject.call(this,scene);

	this.base = new Cylinder(scene,4,3.5,.5,12,2);
	this.support = new Cylinder(scene,.75,.75,8,6,6);
	this.head = new Sphere(scene,2.5,10,10);
}

Node.prototype = Object.create(CGFobject.prototype);
Node.prototype.constructor=Node;

Node.prototype.display = function () {
	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2,1,0,0);
	this.scene.scale(.08,.08,.08);

	this.scene.pushMatrix();
	this.base.display();
	this.scene.popMatrix();

	this.scene.pushMatrix();
	this.scene.translate(0,0,.5);
	this.support.display();
	this.scene.popMatrix();

	this.scene.pushMatrix();
	this.scene.translate(0,0,9);
	this.head.display();
	this.scene.popMatrix();

	this.scene.popMatrix();
}

Node.prototype.updateTexCoords = function (length_s, length_t) {
}
