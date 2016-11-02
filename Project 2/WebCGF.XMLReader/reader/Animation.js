/**
 * Animation
 * @constructor
 */
function Animation(id, time) {
    if (this.constructor === Animation) {
        throw new Error("Can't instantiate abstract class!");
    }
    this.id = id;
    this.span = time;
}

Animation.prototype.constructor = Animation;

/**
 * Returns animation id
 */
Animation.prototype.getID=function() {
    return this.id;
};

/**
 * Returns animation span time
 */
Animation.prototype.getSpan=function() {
    return this.span;
};