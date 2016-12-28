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
uniform float radius;

uniform float normScale;

void main() {
        vTextureCoord = aTextureCoord;
        coords = vec2(aTextureCoord.x*du, aTextureCoord.y*dv);
        vec2 indexCoords = coords;
        if(su != -1.0 && sv != -1.0){
                if(indexCoords.x >= (su - 0.55) && indexCoords.x <= (su + 0.55) && indexCoords.y >= (sv - 0.55) && indexCoords.y <= (sv + 0.55)){
                    isSelected = 0.0;
                }
                else isSelected = 1.0;
        } else isSelected = 1.0;
    	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
