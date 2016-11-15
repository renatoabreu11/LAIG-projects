/**
 * Vehicle -> Spaceship
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Vehicle(scene) {
	CGFobject.call(this,scene);

	this.innerRadius = 5;
	this.outerRadius = 11;
	this.height =3;

    this.createLowerSpaceShip();
    this.dome = new HalfSphere(scene,7,6);

    this.domeAppearance = new CGFappearance(this.scene);
    this.domeAppearance.loadTexture("../res/white.jpg");
}

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor=Vehicle;

Vehicle.prototype.display = function () {
    this.scene.pushMatrix();

    this.loweSpaceShip.display(); /*TO DO: draw a real vehicle!*/
    
    this.scene.translate(1,2.5,0);
    this.scene.scale(4.1,4.6,3.8);
    this.domeAppearance.apply();
    this.dome.display();

    this.scene.popMatrix();
}

Vehicle.prototype.createLowerSpaceShip = function(){

	var orderU = 2;
	var orderV= 9;

	var radiusDiff=this.outerRadius-this.innerRadius;
	var controlPoints=[];
	for(u=0; u<=orderU; u++){
		var uProp = u/orderU;
		var h=this.height*uProp;
		var radius = this.outerRadius - uProp*radiusDiff;
		for(v=0; v<=orderV; v++){
			var ang=(2*Math.PI)*(v/orderV);
			controlPoints.push([radius*Math.cos(ang),h,radius*Math.sin(ang),1]);
		}

	}

	this.loweSpaceShip = new Patch(this.scene,orderU,orderV,1,9,controlPoints);
}


Vehicle.prototype.updateTexCoords = function (length_s, length_t){}
