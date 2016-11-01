/**
 * CircularAnimation
 * @constructor
 */
function CircularAnimation(id, span, center, radius, startAngle, rotAngle) {
    Animation.call(id, span);
    this.center = center;
    this.radius = radius;
    this.startAngle = startAngle;
    this.rotAngle = rotAngle;
}

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;