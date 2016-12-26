function Unit(scene){
	CGFobject.call(this,scene);

	this.unit = new HalfSphere(scene,8,8);
}

Unit.prototype = Object.create(CGFobject.prototype);
Unit.prototype.constructor=Unit;

Unit.prototype.display = function () {
	this.scene.pushMatrix();
	this.scene.scale(.3,.3,.3);
	this.unit.display();
	this.scene.popMatrix();
}

Unit.prototype.updateTexCoords = function (length_s, length_t) {
}
