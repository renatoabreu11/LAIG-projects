/**
 * Vehicle -> Spaceship
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Vehicle(scene) {
	CGFobject.call(this,scene);

	this.innerRadius = 5; //not a real radius
	this.outerRadius = 23;//not a real radius
	this.height =4;

    this.createHull(); //casco
    this.dome = new HalfSphere(scene,7,6); //cupula

    this.domeAppearance = new CGFappearance(this.scene);
    this.domeAppearance.loadTexture("../res/white.jpg");
}

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor=Vehicle;

Vehicle.prototype.display = function () {
    this.scene.pushMatrix();

    this.hull.display();
    
    this.scene.translate(1,4,0);
    this.scene.scale(4.1,4.6,3.8);
    this.domeAppearance.apply();
    this.dome.display();

    this.scene.popMatrix();
}

Vehicle.prototype.createHull = function(){

	var orderU = 3;
	var orderV= 10;

	var radiusDiff=this.outerRadius-this.innerRadius;
	var controlPoints=[];
	for(u=0; u<=orderU; u++){
		var uProp = u/orderU;
		var h=this.height*uProp;
		var radius = this.outerRadius - uProp*radiusDiff;
		for(v=0; v<=orderV; v++){
			if(uProp==0){
				controlPoints.push([0,0,0,1]);
				continue;
			}
			var ang=(2*Math.PI)*(v/orderV);
			controlPoints.push([radius*Math.cos(ang),h,radius*Math.sin(ang),1]);
		}

	}

	this.hull = new Patch(this.scene,orderU,orderV,4,9,controlPoints);
}


Vehicle.prototype.updateTexCoords = function (length_s, length_t){}
