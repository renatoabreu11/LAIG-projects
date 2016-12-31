#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec3 colour;

uniform float norm;

void main() {
	float scale = 0.9 + norm*0.1;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, scale);
}
