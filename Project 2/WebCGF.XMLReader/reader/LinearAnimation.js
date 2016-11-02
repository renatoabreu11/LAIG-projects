/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(id, span, point) {
    Animation.call(this, id, span);
    this.controlPoint = point;
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

/**
 * Returns control point
 */
LinearAnimation.prototype.getControlPoint=function() {
    return this.controlPoint;
};

/**
 * Returns transformation matrix
 */
LinearAnimation.prototype.getMatrix = function (time) {
    var matrix = mat4.create();
    matrix = mat4.identity(matrix);
    if (time > this.span)
        return matrix;
    else {
        var translation = vec3.create();
        vec3.set(translation, this.controlPoint.x, this.controlPoint.y, this.controlPoint.z);
        mat4.translate(matrix, matrix, translation);
    }
};

