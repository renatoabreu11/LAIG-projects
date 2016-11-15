attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
varying vec4 finalColour;
uniform sampler2D uSampler2;
uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;
uniform float du;
uniform float dv;

uniform float normScale;

void main() {
	vTextureCoord = aTextureCoord;

    if(vTextureCoord.x >= 0.1 && vTextureCoord.x <= 0.2)
        finalColour = c1;
    else finalColour = c2;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
