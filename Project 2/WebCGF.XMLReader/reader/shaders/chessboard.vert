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
varying float isSelected;
uniform sampler2D uSampler2;
uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;
uniform float du;
uniform float dv;
uniform float su;
uniform float sv;

uniform float normScale;

void main() {
    vec3 offset = vec3(0.0, 0.0, 0.0);
    vTextureCoord = aTextureCoord;
    float x = floor(aTextureCoord.x*du);
    float y = floor(aTextureCoord.y*dv);
	if((x >= su && y >= sv) && (x <= (su + 1.0) && y <= (sv + 1.0))){
	    isSelected = 0.0;
	}
    else isSelected = 1.0;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
