#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float time;

varying vec2 vTextureCoord;

void main() {
    vTextureCoord = aTextureCoord;
    float xx = aVertexPosition.x;
	float yy = aVertexPosition.y;
	float pi = 3.14159;
    float A = 0.15;
    float w = 10.0 * pi;
	float offset = sin( w*xx + time*100.0) * A + cos(w*yy + time*100.0)*A;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal*offset, 1.0);
}
