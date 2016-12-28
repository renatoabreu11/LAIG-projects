function InfoMarker(scene){
	CGFobject.call(this,scene);

	this.rect = new Rectangle(scene,-3,3,3,-3);
	this.time = {hours : 0, minutes : 0, seconds : 0 };
	this.numbersTextures = [];

	for(n=0; n<=9; n++){
		number = new CGFappearance(this.scene);
    	number.loadTexture('../res/numbers/'+n+'.png');
    	this.numbersTextures.push(number);
	}
	this.boxAppearance = new CGFappearance(this.scene);
	this.boxAppearance.loadTexture('../res/ice.jpg');
}

InfoMarker.prototype = Object.create(CGFobject.prototype);
InfoMarker.prototype.constructor=InfoMarker;

InfoMarker.prototype.display = function () {
	
	// ------------------ marker general structure ------------------
	this.boxAppearance.apply();
	this.scene.pushMatrix(); //x+
	this.scene.translate(9,0,0);
	this.scene.rotate(Math.PI/2,0,-1,0);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //x-
	this.scene.translate(-9,0,0);
	this.scene.rotate(Math.PI/2,0,1,0);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //y+
	this.scene.scale(3,1,1);
	this.scene.translate(0,3,0);
	this.scene.rotate(Math.PI/2,1,0,0);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //y-
	this.scene.scale(3,1,1);
	this.scene.translate(0,-3,0);
	this.scene.rotate(Math.PI/2,-1,0,0);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //z-
	this.scene.scale(3,1,1);
	this.scene.translate(0,0,-3);
	this.rect.display();
	this.scene.popMatrix();

	this.scene.pushMatrix(); //z+
	this.scene.scale(3,1,1);
	this.scene.translate(0,0,2.9);
	this.scene.rotate(Math.PI,0,1,0);
	this.rect.display();
	this.scene.popMatrix();

	
	// ------------------ time (on z+) ------------------
	for(i=0; i<6; i++){
		this.scene.pushMatrix(); //hours 1
		this.scene.scale(1/2,1,1);
		this.scene.translate(-15+i*6,0,3);
		this.scene.rotate(Math.PI,0,1,0);
		this.applyNumber(i);
		this.rect.display();
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
