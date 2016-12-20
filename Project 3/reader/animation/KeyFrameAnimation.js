/**
 * KeyFrameAnimation
 * @constructor
 */
function KeyFrameAnimation(id, span, points) {
    Animation.call(this, id, span);
    this.points=[];
}

KeyFrameAnimation.prototype = Object.create(Animation.prototype);
KeyFrameAnimation.prototype.constructor = KeyFrameAnimation;

KeyFrameAnimation.prototype.addControlPoint=function(x, y, z) {
    var point = [];
    point.push(x, y, z);
    this.points.push(point);
};

KeyFrameAnimation.prototype.vecMultN = function (n,vec){
    var nVec = [n,n,n];
    for(i=0; i<3; i++) nVec[i] = vec[i] * nVec[i];
    return nVec;
};

KeyFrameAnimation.prototype.vecAddVec = function (vec1,vec2){
    var vec = [];
    for(i=0;i<3;i++) vec[i]=vec1[i]+vec2[i];
    return vec;
};

KeyFrameAnimation.prototype.getCurrPos = function(t){
    var u = 1-t;
    var tt = t*t;
    var uu = u*u;
    var uuu = uu*u;
    var ttt = tt*t;

    var p = [0,0,0];
    p = this.vecMultN(uuu,this.points[0]); //first term
    p = this.vecAddVec(p,this.vecMultN(3*uu*t,this.points[1])); //second term
    p = this.vecAddVec(p,this.vecMultN(3*u*tt,this.points[2])); //third term
    p = this.vecAddVec(p,this.vecMultN(ttt,this.points[3])); //fourth term

    return p;
}

/**
 * Returns transformation matrix
 */
KeyFrameAnimation.prototype.getMatrix = function (time) {
    var matrix = mat4.create();
    matrix = mat4.identity(matrix);

    //set t (deltaTime in percentage)
    if (time >= this.span)
        time = this.span;
    var t = time/this.span;

    var p = this.getCurrPos(t);

    var pos = vec3.create();
    vec3.set(pos,p[0],p[1],p[2]);
    mat4.translate(matrix, matrix, pos);
    
    return matrix;
};

