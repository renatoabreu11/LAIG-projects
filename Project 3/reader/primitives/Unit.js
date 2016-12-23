function Unit(scene){
	CGFobject.call(this,scene);

	this.unit = new HalfSphere(scene,8,8);

	this.isSelected=false;
	this.selected = new CGFappearance(this.scene);
    this.selected.loadTexture('../res/sand.jpg');
}

Unit.prototype = Object.create(CGFobject.prototype);
Unit.prototype.constructor=Unit;

Unit.prototype.display = function () {
	if(this.isSelected)
		this.selected.apply();
	this.scene.pushMatrix();
	this.scene.scale(.3,.3,.3);
	this.unit.display();
	this.scene.popMatrix();
}

Unit.prototype.updateTexCoords = function (length_s, length_t) {
}

Unit.prototype.select = function () {
	this.isSelected=true;
}

Unit.prototype.deselect = function () {
	this.isSelected=false;
}
