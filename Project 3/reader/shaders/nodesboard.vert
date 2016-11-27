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
    coords = vec2(aTextureCoord.x*du, aTextureCoord.y*dv);
    vec2 indexCoords = coords;

    float factor = .969;
    float margin = .645;
    float x = margin + factor*(su-1.0);
    float y = margin + factor*(sv-1.0);

   if((indexCoords.x >= x && indexCoords.y >= y) && (indexCoords.x <= (x + margin) && indexCoords.y <=(y + margin))){
        isSelected = 0.0;
        offset=aVertexNormal*.2;
    } else isSelected = 1.0;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}
