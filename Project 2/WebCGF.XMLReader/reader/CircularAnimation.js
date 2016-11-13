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
    this.angularVelocity = this.rotAngle/this.span;
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
 * Returns angular velocity
 */
CircularAnimation.prototype.getAngularVelocity = function () {
    return this.angularVelocity;
};

/**
 * Returns transformation matrix
 */
CircularAnimation.prototype.getMatrix = function (time) {
    var matrix = mat4.create();
    matrix = mat4.identity(matrix);

    var deltaAng = time * this.angularVelocity;
    if (time >= this.span)
        deltaAng = this.span * this.angularVelocity;

    deltaAng += this.startAngle;

    var translation = vec3.create();
    vec3.set(translation, this.center['x'], this.center['y'], this.center['z']);
    mat4.translate(matrix, matrix, translation);
    mat4.rotateY(matrix, matrix, deltaAng);
    vec3.set (translation, this.radius, 0, 0);
    if(this.rotang > 0)
         mat4.rotateY(matrix, matrix, Math.PI);
    return matrix;
};