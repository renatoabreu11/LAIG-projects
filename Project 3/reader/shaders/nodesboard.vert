#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
varying vec2 coords;
varying float isSelected;
uniform sampler2D uSampler2;
uniform vec4 cs;
uniform float du;
uniform float dv;
uniform float su;
uniform float sv;

uniform float normScale;

void main() {
    vec3 offset = vec3(0.0, 0.0, 0.0);
    vTextureCoord = aTextureCoord;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}
