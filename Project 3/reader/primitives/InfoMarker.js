function InfoMarker(scene){
	CGFobject.call(this,scene);

	this.rect = new Rectangle(scene,-3,3,3,-3);
	this.time = {hours : 0, minutes : 0, seconds : 0 };

	this.timeAppearance = new CGFappearance(this.scene);
	this.timeAppearance.loadTexture("../res/marker/time.png");
	this.scoreAppearance = new CGFappearance(this.scene);
	this.scoreAppearance.loadTexture("../res/marker/player_score.png");
	this.twoDotsAppearance = new CGFappearance(this.scene);
	this.twoDotsAppearance.loadTexture("../res/marker/twodots.png");

	this.movieAppearance = new CGFappearance(this.scene);
	this.movieAppearance.setAmbient(255,255,255,1);
	this.movieAppearance.loadTexture("../res/MovieTime.jpg");
	this.winner1Appearance = new CGFappearance(this.scene);
	this.winner1Appearance.setAmbient(255,255,255,1);
	this.winner1Appearance.loadTexture("../res/Winner1.jpg");
    this.winner1Appearance.setTextureWrap('REPEAT', 'REPEAT');
	this.winner2Appearance = new CGFappearance(this.scene);
	this.winner2Appearance.setAmbient(255,255,255,1);
	this.winner2Appearance.loadTexture("../res/Winner2.jpg");
    this.winner2Appearance.setTextureWrap('REPEAT', 'REPEAT');
	this.menuAppearance = new CGFappearance(this.scene);
	this.menuAppearance.setAmbient(255,255,255,1);
	this.menuAppearance.loadTexture("../res/Nodes.png");
	this.errorAppearance = new CGFappearance(this.scene);
	this.errorAppearance.setAmbient(255,255,255,1);
	this.errorAppearance.loadTexture("../res/Server.png");

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
    this.updateTime();
    var state=this.scene.nodes.gameState;
    if(this.scene.nodes.savingGame){
        var nodes = this.scene.nodes;
        var winner = nodes.savedGames[nodes.savedGames.length-1].getWinner();
        if(winner==nodes.player1)
            state=this.winner1Appearance;
        else state=this.winner2Appearance;
    } else if(state==Nodes.gameState.MOVIE)
        state=this.movieAppearance;
    else if(state==Nodes.gameState.MENU)
        state=this.menuAppearance;
    else if(state == Nodes.gameState.CONNECTION_REFUSED)
		state=this.errorAppearance;
	else
        state=null;


	this.scene.pushMatrix();
	this.scene.scale(.25,.25,.25);
	
	// ------------------ marker general structure ------------------
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

	if(state != null){
		state.apply();
		this.rect.updateTexCoords(-6,-6);
	}
	this.scene.pushMatrix(); //z+
	this.scene.scale(6,3,1);
	this.scene.translate(0,0,2.9);
	this.scene.rotate(Math.PI,0,1,0);
	this.rect.display();
	this.scene.popMatrix();
	
	if(state == null)
	{
		this.scene.pushMatrix(); //time
		this.scene.translate(0,6,0);
		this.displayClock();
		this.scene.popMatrix();

		this.scene.pushMatrix(); //p1 score
		this.displayScore(this.scene.nodes.player1.getTeam());
		this.scene.popMatrix();

		this.scene.pushMatrix(); //p2 score
		this.scene.translate(0,-6,0);
		this.displayScore(this.scene.nodes.player2.getTeam());
		this.scene.popMatrix();
	}

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
	this.twoDotsAppearance.apply();
	for(i=0; i<=1; i++) {
		this.scene.pushMatrix();
		this.scene.scale(.25,1,1);
		this.scene.translate(23+25*i,0,3);
		this.scene.rotate(Math.PI,0,1,0);
		this.rect.display();
		this.scene.popMatrix();
	}
}

InfoMarker.prototype.displayScore = function(player){
	// ------------------ "player score" (on z+) ------------------
	this.scene.pushMatrix();
	this.scene.scale(5,1,1);
	this.scene.translate(-.5,0,3);
	this.scene.rotate(Math.PI,0,1,0);
	this.scoreAppearance.apply();
	this.rect.display();
	this.scene.popMatrix();

	// ------------------ player number (on z+) ------------------
	this.scene.pushMatrix();
	this.scene.scale(.5,.5,1);
	this.scene.translate(-6,0,3.01);
	this.scene.rotate(Math.PI,0,1,0);
	this.numbersTextures[player=="blue" ? 1 : 2].apply();
	this.rect.display();
	this.scene.popMatrix();

	// ------------------ score (on z+) ------------------
	var score=0;
	var savedGames=this.scene.nodes.getSavedGames();
	for(save of savedGames) {
		if(save.getWinner().getTeam() == player){
			score++;
		}
	}
	this.scene.pushMatrix();
	this.scene.scale(.5,.5,1);
	this.scene.translate(30,0,3.01);
	this.scene.rotate(Math.PI,0,1,0);
	this.numbersTextures[score].apply();
	this.rect.display();
	this.scene.popMatrix();
}

InfoMarker.prototype.updateTime = function() {
	//set time
	var time;
	if(this.scene.nodes.turnFinishingTime==-1)
		time=0;
	else time = this.scene.nodes.turnFinishingTime - this.scene.getElapsedTime();

	//check for when timer is out
	if(time<0)
		time=0;


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
