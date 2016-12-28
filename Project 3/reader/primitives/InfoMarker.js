function InfoMarker(scene){
	CGFobject.call(this,scene);

	this.rect = new Rectangle(scene,-3,3,3,-3);
	this.circle = new Circle (scene,.5,8);
	this.time = {hours : 0, minutes : 0, seconds : 0 };

	this.boxAppearance = new CGFappearance(this.scene);
	this.boxAppearance.loadTexture('../res/ice.jpg');

	this.timeAppearance = new CGFappearance(this.scene);
	this.timeAppearance.loadTexture("../res/marker/time.png");
	this.scoreAppearance = new CGFappearance(this.scene);
	this.scoreAppearance.loadTexture("../res/marker/player_score.png");

	this.numbersTextures = [];
	for(n=0; n<=9; n++){
		number = new CGFappearance(this.scene);
    	number.loadTexture('../res/marker/'+n+'.png');
    	this.numbersTextures.push(number);
	}
}

InfoMarker.prototype = Object.create(CGFobject.prototype);
InfoMarker.prototype.constructor=InfoMarker;

InfoMarker.prototype.display = function () {
	
	// ------------------ marker general structure ------------------
	this.boxAppearance.apply();
	this.scene.pushMatrix(); //x+
	this.scene.scale(1,3,1);
	this.scene.translate(18,0,0);
	this.scene.rotate(Math.PI/2,0,-1,0);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //x-
	this.scene.scale(1,3,1);
	this.scene.translate(-18,0,0);
	this.scene.rotate(Math.PI/2,0,1,0);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //y+
	this.scene.scale(6,1,1);
	this.scene.translate(0,9,0);
	this.scene.rotate(Math.PI/2,1,0,0);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //y-
	this.scene.scale(6,1,1);
	this.scene.translate(0,-9,0);
	this.scene.rotate(Math.PI/2,-1,0,0);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //z-
	this.scene.scale(6,3,1);
	this.scene.translate(0,0,-3);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //z+
	this.scene.scale(6,3,1);
	this.scene.translate(0,0,2.9);
	this.scene.rotate(Math.PI,0,1,0);
	this.rect.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
	this.scene.translate(0,6,0);
	this.displayClock();
	this.scene.popMatrix();
}

InfoMarker.prototype.displayClock = function() {
	// ------------------ "time" (on z+) ------------------
	this.scene.pushMatrix();
	this.scene.scale(3,1,1);
	this.scene.translate(-3,0,3);
	this.scene.rotate(Math.PI,0,1,0);
	this.timeAppearance.apply();
	this.rect.display();
	this.scene.popMatrix();

	// ------------------ time (on z+) ------------------
	var offset=0;
	for(i=0; i<6; i++){
		this.scene.pushMatrix(); //hours 1
		this.scene.scale(2/5,1,1);
		this.scene.translate(3+offset,0,3);
		this.scene.rotate(Math.PI,0,1,0);
		this.applyNumber(i);
		this.rect.display();
		this.scene.popMatrix();
		offset+=6;
		if(i%2 == 1)
			offset+=4;
	}

	// ------------------ time points (on z+) ------------------
	this.boxAppearance.apply();
	for(i=-1; i<=1; i+=2)
		for(j=-1; j<=1; j+=2){
			this.scene.pushMatrix();
			this.scene.translate(8.8+j*3.2,i*1.8,3);
			this.circle.display();
			this.scene.popMatrix();
		}
}

InfoMarker.prototype.updateTime = function(time) {
	var timeS = Math.trunc(time);
	this.time.seconds = timeS % 60;

	var timeM = (timeS - this.time.seconds)/60;
	this.time.minutes = timeM % 60;

	this.time.hours=(timeM - this.time.minutes)/60;
}

InfoMarker.prototype.applyNumber = function(n){
	
	var number;
	switch(n){
		case 0:
		number = Math.trunc(this.time.hours / 10);
		break;

		case 1:
		number = this.time.hours % 10;
		break;

		case 2:
		number = Math.trunc(this.time.minutes / 10);
		break;

		case 3:
		number = this.time.minutes % 10;
		break;

		case 4:
		number = Math.trunc(this.time.seconds / 10);
		break;

		case 5:
		number = this.time.seconds % 10;
		break;
	}
	this.numbersTextures[number].apply();
	this.rect.updateTexCoords(-6,-6);
}

InfoMarker.prototype.updateTexCoords = function (length_s, length_t) {
}
