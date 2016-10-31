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
	
	// init GUI. For more information on the methods, check:
	//  http://workshop.chromeexperiments.com/examples/gui
	
	this.gui = new dat.GUI();

	this.lightGroup=this.gui.addFolder('Lights');	
	this.lightGroup.open();

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
		case (65):	
		case (65+32):	// 'A' or 'a'
			break;
		case(68):
		case(68+32):	// 'D' or 'd'
			break;
		case(87):
		case(87+32):	// 'W' or 'w'
			break;
		case(83):
		case(83+32):	// 'S' or 's'
			break;
		case(86):
		case(86+32):
			this.scene.updateCamera();
			this.setActiveCamera(this.scene.camera);
			break;
		case(77):
		case(77+32):
			this.scene.updateMaterials();
			break;

	};
};

