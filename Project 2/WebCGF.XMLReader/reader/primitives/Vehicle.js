/**
 * Vehicle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Vehicle(scene) {
	CGFobject.call(this,scene);

    this.rectangle = new Rectangle(scene,0,0,10,10);

}

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor=Vehicle;

Vehicle.prototype.display = function () {
    this.rectangle.display(); /*TO DO: draw a real vehicle!*/
}


Vehicle.prototype.updateTexCoords = function (length_s, length_t){}
