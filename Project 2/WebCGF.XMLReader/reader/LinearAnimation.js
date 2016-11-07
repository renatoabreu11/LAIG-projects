/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(id, span) {
    Animation.call(this, id, span);
    this.velocity = 0;
    this.distance = 0;
    this.controlPoints = [];
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

/**
 * Returns control point
 */
LinearAnimation.prototype.getControlPoints=function() {
    return this.controlPoints;
};

LinearAnimation.prototype.addControlPoint=function(x, y, z) {
    var point = vec3.create();
    vec3.set (point, x, y, z);
    this.controlPoints.push(point);
    var length = this.controlPoints.length;
    if(length >=  2){
        var point1 = this.controlPoints[length - 2];
        var point2 = this.controlPoints[length - 1];
        var distanceBetweenPoints = vec3.distance(point2, point1);
        this.distance += distanceBetweenPoints;
        this.velocity = this.distance/this.span;
    }
};


/**
 * Returns transformation matrix
 */
LinearAnimation.prototype.getMatrix = function (time) {
    var matrix = mat4.create();
    matrix = mat4.identity(matrix);

    var deltaAng = time * this.angularVelocity;
    if (time >= this.span)
        deltaAng = this.span * this.angularVelocity;

    deltaAng += this.startAngle;

    var translation = vec3.create();
    vec3.set (translation, this.center[0], this.center[1], this.center[2]);
    mat4.translate(matrix, matrix, translation);
    mat4.rotateY(matrix, matrix, deltaAng);
    vec3.set (translation, this.radius, 0, 0);
    return matrix;
};

