#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

varying float isSelected;
varying vec2 coords;
uniform vec4 cs;
uniform float du;
uniform float dv;
uniform float su;
uniform float sv;

void main() {
    vec4 resultantColour;
    vec4 color = texture2D(uSampler, vTextureCoord);

    if(isSelected == 0.00)
        resultantColour = cs;
    else resultantColour = color;

	gl_FragColor = color * resultantColour;
}
