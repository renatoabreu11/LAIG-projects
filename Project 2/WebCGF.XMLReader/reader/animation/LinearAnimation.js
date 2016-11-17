/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(id, span) {
    Animation.call(this, id, span);
    this.velocity = 0;
    this.distance = 0;
    this.controlPoints = [];
    this.distanceBetweenPoints = [];
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

/**
 * Returns control point
 */
LinearAnimation.prototype.getControlPoints=function() {
    return this.controlPoints;
};

/**
 * Returns distance between points
 */
LinearAnimation.prototype.getDistanceBetweenPoints=function() {
    return this.distanceBetweenPoints;
};

/**
 * Returns velocity
 */
LinearAnimation.prototype.getVelocity=function() {
    return this.velocity;
};

/**
 * Returns total distance
 */
LinearAnimation.prototype.getDistance=function() {
    return this.velocity;
};


LinearAnimation.prototype.addControlPoint=function(x, y, z) {
    var point = vec3.create();
    vec3.set (point, x, y, z);
    this.controlPoints.push(point);
    var length = this.controlPoints.length;
    if(length >=  2){
        var point1 = this.controlPoints[length - 2];
        var point2 = this.controlPoints[length - 1];
        var dist = vec3.distance(point2, point1);
        this.distanceBetweenPoints.push(dist);
        this.distance += dist;
        this.velocity = this.distance/this.span;
    }
};


/**
 * Returns transformation matrix
 */
LinearAnimation.prototype.getMatrix = function (time) {
    var matrix = mat4.create();
    matrix = mat4.identity(matrix);

    if (time >= this.span){
        time = this.span;
    }

    var currentDist = this.velocity * time;
    var totalDist = 0, index = 0;
    for(var i = 0; i < this.distanceBetweenPoints.length; i++){
        totalDist += this.distanceBetweenPoints[i];
        if(totalDist >= currentDist){
            index = i;
            break;
        }
    }
    totalDist -= this.distanceBetweenPoints[index];

    var segmentDist  = currentDist - totalDist;
    var t = segmentDist / this.distanceBetweenPoints[index];
    var interpolation = this.lerp(this.controlPoints[index], this.controlPoints[index+1], t);
    var angle = this.getAngle(this.controlPoints[index], this.controlPoints[index+1]);
    mat4.translate(matrix, matrix, interpolation);
    mat4.rotateY(matrix, matrix, angle);
    return matrix;
};

LinearAnimation.prototype.lerp = function (point1, point2, t) {
    var interpolation = vec3.create();
    for(var i = 0; i < point1.length; i++){
        interpolation[i] = point1[i]*(1-t) + t * point2[i];
    }
    return interpolation;
};

LinearAnimation.prototype.getAngle = function (point1, point2) {
    var deltaX = point2[0] - point1[0];
    var deltaZ = point2[2]- point1[2];
    return (-Math.atan2(deltaZ, deltaX) + Math.PI/8);
};

