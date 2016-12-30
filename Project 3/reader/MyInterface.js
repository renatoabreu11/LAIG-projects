/**
 * MyInterface
 * @constructor
 */
function MyInterface() {
	CGFinterface.call(this);
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function(application) {
	CGFinterface.prototype.init.call(this, application);

	this.gui = new dat.GUI();

    this.gameGroup=this.gui.addFolder('Game Options');
    this.gameGroup.add(this.scene, 'Mode', [ 'Player vs Player', 'Player vs Bot', 'Bot vs Bot' ] );
    this.gameGroup.add(this.scene, 'Difficulty', [ 'Easy', 'Medium', 'None' ] );
    this.gameGroup.add(this.scene, "StartGame");
    this.gameGroup.add(this.scene, "ExitGame");
    this.gameGroup.add(this.scene, 'TurnTime', 30, 120);
    this.gameGroup.addColor(this.scene, 'player1');
    this.gameGroup.addColor(this.scene, 'player2');
    this.gameGroup.open();

    this.undoGroup=this.gui.addFolder("Undo Options");
    this.undoGroup.close();
    this.undoGroup.add(this.scene, "Undo");
    this.undoGroup.add(this.scene, "ResetMoves");

	this.lightGroup=this.gui.addFolder('Lights');	
	this.lightGroup.close();

    this.scenarioGroup=this.gui.addFolder('Scenario');
    this.scenarioGroup.add(this.scene, "Scene", [ 'Tron', 'Citadella']);
    this.scenarioGroup.add(this.scene, "LoadScenario");
    this.scenarioGroup.add(this.scene, "ChangeView");
    this.scenarioGroup.close();

	return true;
};

/**
 * Function that removes a folder
 * @param name
 */
MyInterface.prototype.removeFolder = function(name) {
    var folder = this.gui.__folders[name];
    if (!folder) {
        return;
    }
    folder.close();
    this.gui.__ul.removeChild(folder.domElement.parentNode);
    delete this.gui.__folders[name];
    this.gui.onResize();
}

/**
 * AddLight to folder lightGroup
 * @param {[int]} i  [light number]
 * @param {[string]} id [light id]
 */
MyInterface.prototype.addLight = function(i, id){
	this.lightGroup.add(this.scene.lightStatus, i, this.scene.lightStatus[i]).name(id);
}

/**
 * Updates the movie folder with the last one
 * @param movies
 */
MyInterface.prototype.addMovie = function(movies){
    this.moviesGroup=this.gui.addFolder('Game Movies');
    this.moviesGroup.add(this.scene, "Movie", movies);
    this.moviesGroup.close();
    this.moviesGroup.add(this.scene, "StartMovie");
    this.moviesGroup.add(this.scene, "ExitMovie");
}

/**
 * processKeyboard
 * @param event {Event}
 */
MyInterface.prototype.processKeyboard = function(event) {
	CGFinterface.prototype.processKeyboard.call(this,event);

	switch (event.keyCode)
	{
		case(86):
		case(86+32):
			this.scene.updateCamera();
			this.setActiveCamera(this.scene.camera);
			break;
		case(77):
		case(77+32):
			this.scene.updateMaterials();
			break;
		case(76):
		case(108):
		    var currentView = this.scene.getDefaultCamID();
		    var nextView = this.scene.graph.getNextView();
		    var transition;
            switch(currentView){
                case "menuView": transition = "camFromMenuToP1"; break;
                case "player1View1": transition = "camAdvance"; break;
                case "player1View2": transition = "camAdvance"; break;
                case "player1View3": transition = "camFromP1ToLat"; break;
                case "lateralView": transition = "camFromLatToP2"; break;
                case "player2View1": transition = "camAdvance"; break;
                case "player2View2": transition = "camAdvance"; break;
                case "player2View3": transition = "camFromMenuToP1"; break;
            }
			this.scene.switchCamera(nextView["id"], transition);
			break;
		default:
			console.log("Unexpected keystroke with code "+event.keyCode);
			break;

	};
};

