/**
 * XMLscene constructor
 */
function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * Init Xml scene variables
 * @param  {[CGFapplication]} scene application
 */
XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
	this.gl.depthFunc(this.gl.LEQUAL);
	this.gl.enable(this.gl.BLEND);
	this.gl.blendEquation(this.gl.FUNC_ADD);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	this.gl.depthFunc(this.gl.LEQUAL);
	this.gl.depthMask(true);

    this.enableTextures(true);

	this.lightStatus = [];
	this.undo = false;
	this.resetMoves = false;
	this.Mode = "Player vs Player";
	this.Difficulty = "None";
    this.Movie = null;
	this.player1 = "#216bff";
	this.player2 = "#cd270e";
	this.TurnTime = 60;
	this.Scene = "Citadella";

    this.updatePeriod = 1 / 60 * 1000;	// update period in ms (1/60 * 1000 ms = 60 Hz)
    this.setUpdatePeriod(this.updatePeriod);
    this.initialTime = 0;
    this.elapsedTime = 0;

    this.pickObjectID = 1;
    this.setPickEnabled(true);

    this.transitionCam=null;

    this.nodes = new Nodes(this);
    this.marker = new InfoMarker(this);
};

/**
 * Sets scene interface
 * @param {[MyInterface]} myInterface
 */
XMLscene.prototype.setInterface = function(myInterface){
    this.interface = myInterface;
}

/**
 * Handler called when the graph is finally loaded.
 * As loading is asynchronous, this may be called already after the application has started the run loop
 */
XMLscene.prototype.onGraphLoaded = function ()
{
    this.gl.clearColor(this.graph.illumination["background"]["r"],this.graph.illumination["background"]["g"],
        this.graph.illumination["background"]["b"],this.graph.illumination["background"]["a"]);

    this.setAmbient(this.graph.illumination["ambient"]["r"],this.graph.illumination["ambient"]["g"],
        this.graph.illumination["ambient"]["b"],this.graph.illumination["ambient"]["a"]);

    this.axis = new CGFaxis(this, this.graph.axisLength, 0.05);
    this.camera = this.graph.getDefaultView();
    this.interface.setActiveCamera(this.camera);
    this.initLights();
    this.materialDefault = new CGFappearance(this);
};

/**
 * Initializes default camera
 */
XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

/**
 * Sets camera to the next view
 */
XMLscene.prototype.updateCamera = function () {
    this.graph.setNextView();
    this.camera = this.graph.getDefaultView();
}

/**
 * Sets camera to the next view with a smooth transition
 */
XMLscene.prototype.switchCamera = function (viewID, transition) {
    var view = this.graph.getView(viewID);
    if(this.transitionCam != null)
        return false;
    transitionCam=[];
    transitionCam["newCam"]= view;
    transitionCam["animation"]=this.graph.animations[this.graph.checkIfExists(this.graph.animations, transition)];
    transitionCam["finishTime"]=this.elapsedTime+transitionCam["animation"].span;
    this.transitionCam=transitionCam;
    return true;
}

/**
 * Returns current camera ID
 */
XMLscene.prototype.getDefaultCamID = function () {
    return this.graph.defaultView;
}

/**
 *
 */
XMLscene.prototype.animateCameraTransition = function () {
    var camInfo=this.transitionCam;

    if(this.elapsedTime>=this.transitionCam["finishTime"]){
        var id = this.transitionCam["newCam"]["id"];
        this.graph.setDefaultView(id);
        this.camera = this.graph.getDefaultView();
        this.transitionCam=null;
        this.interface.setActiveCamera(this.camera);
        return;
    }

    var offset = camInfo["animation"].getCurrPos((camInfo["finishTime"] - this.elapsedTime)/camInfo["animation"].span);

    var view = camInfo["newCam"];
    var fov = view["angle"];
    var near = view["near"];
    var far = view["far"];
    var position = [];
    position["x"] = view["from"]["x"] + offset[0];
    position["y"] = view["from"]["y"] + offset[1];
    position["z"] = view["from"]["z"] + offset[2];
    var target = view["to"];
    this.camera = new CGFcamera(fov, near, far, vec3.fromValues(position["x"], position["y"], position["z"]),
        vec3.fromValues(target["x"], target["y"], target["z"]));
}

/**
 * Initializes lights
 */
XMLscene.prototype.initLights = function () {
    var i = 0;
    for(var light of this.graph.lights){
        this.lights[i].setPosition(light["location"]["x"], light["location"]["y"], light["location"]["z"], light["location"]["w"]);
        this.lights[i].setDiffuse(light["diffuse"]["r"], light["diffuse"]["g"], light["diffuse"]["b"], light["diffuse"]["a"]);
        this.lights[i].setAmbient(light["ambient"]["r"], light["ambient"]["g"], light["ambient"]["b"], light["ambient"]["a"]);
        this.lights[i].setSpecular(light["specular"]["r"], light["specular"]["g"], light["specular"]["b"], light["specular"]["a"]);

        if(light["type"] == "spot"){
            this.lights[i].setSpotCutOff(light["angle"]);
            this.lights[i].setSpotExponent(light["exponent"]);
            var target = [];
            target["x"] = light["target"]["x"] - light["location"]["x"];
            target["y"] = light["target"]["y"] - light["location"]["y"];
            target["z"] = light["target"]["z"] - light["location"]["z"];
            this.lights[i].setSpotDirection(target["x"], target["y"], target["z"]);
        }

        if(light["enabled"]){
            this.lights[i].enable();
            this.lights[i].setVisible(true);
            this.lightStatus[i] = true;
        }else{
            this.lights[i].enable();
            this.lightStatus[i] = false;
        }
        this.lights[i].update();
        this.interface.addLight(i, light["id"]);
        i++;
    }
};

/**
 * Updates lights accordingly to the user input on the interface
 */
XMLscene.prototype.updateLights = function () {
    var i = 0;
    for (i; i < this.lights.length; i++){
        this.lights[i].update();
    }

    for(var j = 0; j < this.lightStatus.length; j++){
        if(this.lightStatus[j]){
            this.lights[j].enable();
            this.lights[j].setVisible(true);
        }else{
            this.lights[j].disable();
            this.lights[j].setVisible(false);
        }
    }
}

/**
 * Changes all the components default material
 */
XMLscene.prototype.updateMaterials = function () {
    for(var component of this.graph.components){
        component.nextMaterial();
    }
}

/**
 * Sets scene appearance to default
 */
XMLscene.prototype.setDefaultAppearance = function ()
{
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

/**
 * Updates elapsed time
 * @param currTime
 */
XMLscene.prototype.update = function(currTime)
{
    if(this.initialTime == 0){
        this.initialTime = currTime;
    }

    this.elapsedTime = (currTime - this.initialTime)/1000;
    this.nodes.update(currTime, this.player1, this.player2);
}

/**
 * Picks an object
 */
XMLscene.prototype.logPicking = function ()
{
    this.pickObjectID = 1;
    if (this.pickMode == false) {
        if (this.pickResults != null && this.pickResults.length > 0) {
            for (var i=0; i< this.pickResults.length; i++) {
                var obj = this.pickResults[i][0];
                if (obj)
                    if (obj instanceof Piece)
                        this.nodes.selectPiece(obj);
                    else if (obj instanceof Tile)
                        this.nodes.tryMovement(obj);
            }
            this.pickResults.splice(0,this.pickResults.length);
        }
    }
}

/**
 * Loop which display the objects that belong to the scene
 */
XMLscene.prototype.display = function () {
    // ---- BEGIN Background, camera and axis setup
    this.logPicking();

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Make camera transition if necessary
    if(this.transitionCam != null){
        this.animateCameraTransition();
    }

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.setDefaultAppearance();

    // ---- END Background, camera and axis setup

    if (this.graph.loadedOk){
        this.updateLights();
        this.materialDefault.apply();
        this.graph.getRootComponent().display(null, null, this.elapsedTime);
    }
    this.nodes.display();
    this.rotate(Math.PI,0,1,0);
};

/**
 * Changes player current view
 * @constructor
 */
XMLscene.prototype.ChangeView = function ()
{
    if(this.nodes.getGameState() == Nodes.gameState.PLAY){
        var player = this.nodes.getCurrentPlayer();
        player.updateView();
        var viewID = player.getCurrentView();
        var viewIndex = player.getViewIndex();
        var transition;
        if(player.getTeam() == "blue"){
            switch (viewIndex){
                case 0: transition = "camFromLatToP1"; break;
                case 1: transition = "camAdvance"; break;
                case 2: transition = "camAdvance"; break;
                case 3: transition = "camFromP1ToLat"; break;
            }
        } else{
            switch (viewIndex){
                case 0: transition = "camFromLatToP2"; break;
                case 1: transition = "camAdvance"; break;
                case 2: transition = "camAdvance"; break;
                case 3: transition = "camFromP2ToLat"; break;
            }
        }
        var success = this.switchCamera(viewID, transition);
        if(!success){
            player.reverseView();
        }
    }
}

/**
 * Loads a scenario accordingly to the user choice
 * @constructor
 */
XMLscene.prototype.LoadScenario = function ()
{
    if(this.nodes.getGameState() == Nodes.gameState.MENU){
        // change scene
    }
}

/**
 * Starts the movie selected by the user
 * @constructor
 */
XMLscene.prototype.StartMovie = function ()
{
    if(this.nodes.getGameState() == Nodes.gameState.MENU){
        this.nodes.initializeMovie(this.Movie);
    }
}

/**
 * Exits current game movie
 * @constructor
 */
XMLscene.prototype.ExitMovie = function ()
{
    if(this.nodes.getGameState() == Nodes.gameState.MOVIE){
        var exitMovie = confirm("Do you really want to quit the current movie?");
        if(exitMovie){
            this.transitionCam=null;
            var camID = this.getDefaultCamID();
            var transition;
            if(camID.match(/player1/g))
                transition = "camFromP1ToLat";
            else if(camID.match(/player2/g))
                transition = "camFromP2ToLat";

            var own = this;
            setTimeout(function(){
                own.switchCamera("lateralView", transition);
                own.nodes.resetMovie();
            }, 1500);
        }
    }
}

/**
 * Updates game movies folder
 */
XMLscene.prototype.addMovie = function ()
{
    var movies = this.nodes.getSavedGames();
    var nrMovies = movies.length;
    this.interface.removeFolder("Game Movies")

    var moviesNames = [];
    for(var i = 0; i < movies.length; i++){
        var name = movies[i].getName();
        moviesNames.push(name);
    }

    this.Movie = moviesNames[nrMovies - 1];

    this.interface.addMovie(moviesNames);
}

/**
 * Starts a new nodes game
 * @constructor
 */
XMLscene.prototype.StartGame = function ()
{
    if(this.nodes.getGameState() == Nodes.gameState.MENU){
        var mode;
        var difficulty;
        switch(this.Mode){
            case "Player vs Player": mode = "pvp"; break;
            case "Player vs Bot": mode = "pvc"; break;
            case "Bot vs Bot": mode = "cvc"; break;
        }
        switch(this.Difficulty){
            case "Easy": difficulty = "easy"; break;
            case "Medium": difficulty = "medium"; break;
            case "None": difficulty = "none"; break;
        }
        this.nodes.initializeGame(mode, difficulty);
    }
}

/**
 * Exits current game
 * @constructor
 */
XMLscene.prototype.ExitGame = function (){
    if(this.nodes.getGameState() == Nodes.gameState.PLAY && this.transitionCam == null){
        var newGame = confirm("Do you really want to quit the current game?");
        if(newGame){
            this.transitionCam=null;
            var camID = this.getDefaultCamID();
            var transition;
            if(camID.match(/player1/g))
                transition = "camFromP1ToLat";
            else if(camID.match(/player2/g))
                transition = "camFromP2ToLat";

            this.switchCamera("lateralView", transition);
            this.nodes.resetGame();
        }
    }
}

/**
 * Calls the function to undo last move
 * @constructor
 */
XMLscene.prototype.Undo = function (){
    if(!this.undo && this.nodes.getGameState() == Nodes.gameState.PLAY){
        this.nodes.undoLastMove();
        this.undo = false;
    }
};

/**
 * Calls the function to reset all moves perfomed in the current turn
 * @constructor
 */
XMLscene.prototype.ResetMoves = function (){
    if(!this.resetMoves && this.nodes.getGameState() == Nodes.gameState.PLAY){
        this.nodes.resetPlayerMoves();
        this.resetMoves = false;
    }
};

/**
 * Returns elapsed time since the program start
 * @returns {number|*}
 */
XMLscene.prototype.getElapsedTime = function() {
    return this.elapsedTime;
}

/**
 * Returns the time defined by the user for each turn
 * @returns {number}
 */
XMLscene.prototype.getTurnTime = function () {
    return this.TurnTime;
}

