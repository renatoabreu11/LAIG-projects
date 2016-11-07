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
    var length = this.controlPoints.length;

    if (time >= this.span){
        mat4.translate(matrix, matrix, this.controlPoints[length - 1])
        return matrix;
    }

    var currentDist = this.velocity * time;
    var totalDist = 0, index = 0;
    for(var i = 0; i < this.distanceBetweenPoints.length; i++){
        totalDist += this.distanceBetweenPoints[i];
        if(totalDist > currentDist){
            index = i;
            break;
        }
    }

    //O objecto está entre os pontos de controlo index - 1 e index.
    return matrix;
};

