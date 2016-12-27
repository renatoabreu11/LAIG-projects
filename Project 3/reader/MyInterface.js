/**
 * MyInterface
 * @constructor
 */
function MyInterface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function(application) {
	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);

	this.gui = new dat.GUI();

	this.lightGroup=this.gui.addFolder('Lights');	
	this.lightGroup.open();

    this.undoGroup=this.gui.addFolder("UndoMoves");
    this.undoGroup.open();
    this.undoGroup.add(this.scene, "Undo");
    this.undoGroup.add(this.scene, "ResetMoves");

	return true;
};

/**
 * AddLight to folder lightGroup
 * @param {[int]} i  [light number]
 * @param {[string]} id [light id]
 */
MyInterface.prototype.addLight = function(i, id){
	this.lightGroup.add(this.scene.lightStatus, i, this.scene.lightStatus[i]).name(id);
}

/**
 * processKeyboard
 * @param event {Event}
 */
MyInterface.prototype.processKeyboard = function(event) {
	// call CGFinterface default code (omit if you want to override)
	CGFinterface.prototype.processKeyboard.call(this,event);
	
	// Check key codes e.g. here: http://www.asciitable.com/
	// or use String.fromCharCode(event.keyCode) to compare chars
	
	// for better cross-browser support, you may also check suggestions on using event.which in http://www.w3schools.com/jsref/event_key_keycode.asp
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
		case(76): //debug [L]
		case(108):
			if(this.scene.transitionCam != null) //caso a transicao nao tenha acabado, nao permite iniciar uma nova
				break;
			transitionCam=[];
			transitionCam["newCam"]=this.scene.graph.getNextView();
			transitionCam["animation"]=this.scene.graph.animations[this.scene.graph.checkIfExists(this.scene.graph.animations, transitionCam["newCam"]["id"]=="player1" ? "camTransition1" : "camTransition2")];
			transitionCam["finishTime"]=this.scene.elapsedTime+transitionCam["animation"].span;
			this.scene.transitionCam=transitionCam;
			break;

		default:
			console.log("Unexpected keystroke with code "+event.keyCode);
			break;

	};
};

