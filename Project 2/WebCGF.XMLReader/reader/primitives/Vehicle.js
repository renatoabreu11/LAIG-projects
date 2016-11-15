/**
 * Vehicle -> Spaceship
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Vehicle(scene) {
	CGFobject.call(this,scene);

    this.createLowerSpaceShip();

}

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor=Vehicle;

Vehicle.prototype.display = function () {
    this.loweSpaceShip.display(); /*TO DO: draw a real vehicle!*/
}

Vehicle.prototype.createLowerSpaceShip = function(){

	var orderU = 2;
	var orderV= 9;

	var innerRadius = 5;
	var outerRadius = 10;
	var radiusDiff=outerRadius-innerRadius;
	var height =3;

	var controlPoints=[];
	for(u=0; u<=orderU; u++){
		var h=height*(u/orderU);
		var radius = outerRadius - (u/orderU)*radiusDiff;
		for(v=0; v<=orderV; v++){
			var ang=(2*Math.PI)*(v/orderV);
			controlPoints.push([radius*Math.cos(ang),h,radius*Math.sin(ang),1]);
		}

	}

	this.loweSpaceShip = new Patch(this.scene,orderU,orderV,1,9,controlPoints);
}


Vehicle.prototype.updateTexCoords = function (length_s, length_t){}
