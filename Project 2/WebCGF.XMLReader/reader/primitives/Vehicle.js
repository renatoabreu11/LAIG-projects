/**
 * Vehicle -> Spaceship
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Vehicle(scene) {
	CGFobject.call(this,scene);

	this.domeAppearance = new CGFappearance(this.scene);
    this.domeAppearance.loadTexture("../res/white.jpg");
    this.legAppearance = new CGFappearance(this.scene);
    this.legAppearance.loadTexture("../res/black.jpg");
    this.hullAppearance = new CGFappearance(this.scene);
    this.hullAppearance.loadTexture("../res/grey.jpg");
    this.fireAppearance = new CGFappearance(this.scene);
    this.fireAppearance.loadTexture("../res/bluefire.jpg");

	this.innerRadius = 5; //not a real radius
	this.outerRadius = 23;//not a real radius
	this.height =4;

    this.createHull(); //casco
    this.dome = new HalfSphere(scene,5,8); //cupula
    this.leg = new Cylinder(scene,.25,.25,6,5,5);//perna(s)
    this.motor = new Cylinder(scene,1,2,4,7,5); //motor(es)
    this.motorAux = new Cylinder(scene,.3,.3,3,5,3); //motor holder
    this.fire = new Cylinder(scene,1.8,.1,5,7,5); //FOGO :DD

}

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor=Vehicle;

Vehicle.prototype.display = function () {
    this.scene.pushMatrix();
    
    //hull
    this.hullAppearance.apply();
    this.hull.display();

    //leg
	this.legAppearance.apply();
    for(i=0;i<3; i++){
    	for(j=-1; j<=1; j+=2){
    		this.scene.popMatrix();
    		this.scene.pushMatrix();

    		this.scene.translate(-3+4*i,1.2,i==1?4.5*j:3.5*j);
    		var ang = -Math.PI/3 + i*Math.PI/3;
    		if(j==-1) this.scene.rotate(Math.PI,0,0,1);
    		this.scene.rotate(ang,0,1,0);
    		this.scene.rotate(Math.PI*3/8,1,0,0);
    		if(j==-1) this.scene.rotate(Math.PI,0,1,0);
			this.leg.display();
		}
	}

    //dome
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.domeAppearance.apply();
    this.scene.translate(1,3.7,0);
    this.scene.scale(4.1,4.6,3.8);
    this.dome.display();

    //motor holder
    this.hullAppearance.apply();
    for(i=-1; i<=1; i+=2){
    	this.scene.popMatrix();
    	this.scene.pushMatrix();
    	this.scene.translate(-1,3.3,i*4.5);
    	if(i==-1)
    		this.scene.rotate(-Math.PI*2/3,1,0,0);
    	else this.scene.rotate(-Math.PI/3,1,0,0);
    	this.motorAux.display();
    }

    //motor
    this.hullAppearance.apply();
    for(i=-1; i<=1; i+=2){
    	this.scene.popMatrix();
    	this.scene.pushMatrix();
    	this.scene.translate(0,6,i*6);
    	this.scene.rotate(-Math.PI/2,0,1,0);
    	this.motor.display();
    }

    //fire
    this.fireAppearance.apply();
    for(i=-1; i<=1; i+=2){
    	this.scene.popMatrix();
    	this.scene.pushMatrix();
    	this.scene.translate(-4,6,i*6);
    	this.scene.rotate(-Math.PI/2,0,1,0);
    	this.fire.display();
    }

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
