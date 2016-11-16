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
	float offset = cos(cos(yy/(3.0)-time*2.0)+(xx*(2.0+2.0)+300.0/(-0.3+2.0)));

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal*offset, 1.0);
}
