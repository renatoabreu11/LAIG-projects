/**
 * CircularAnimation
 * @constructor
 */
function CircularAnimation(id, span, center, radius, startAngle, rotAngle) {
    Animation.call(this, id, span);
    this.center = center;
    this.radius = radius;
    this.startAngle = startAngle;
    this.rotAngle = rotAngle;
}

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

/**
 * Returns center
 */
CircularAnimation.prototype.getCenter = function () {
    return this.center;
};

/**
 * Returns radius
 */
CircularAnimation.prototype.getRadius = function () {
    return this.radius;
};

/**
 * Returns starting angle
 */
CircularAnimation.prototype.getStartAngle = function () {
    return this.startAngle;
};

/**
 * Returns rotation angle
 */
CircularAnimation.prototype.getRotAngle = function () {
    return this.rotAngle;
};

/**
 * Returns transformation matrix
 */
CircularAnimation.prototype.getMatrix = function (time) {
    var matrix = mat4.create();
    matrix = mat4.identity(matrix);
    if (time > this.span)
        return matrix;
    else {
        var translation = vec3.create();
    }
};