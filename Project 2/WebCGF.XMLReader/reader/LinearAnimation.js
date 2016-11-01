/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(id, span, point) {
    Animation.call(id, span);
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