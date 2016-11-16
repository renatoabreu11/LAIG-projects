#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

varying float isSelected;
varying vec2 coords;
uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;
uniform float du;
uniform float dv;
uniform float su;
uniform float sv;

void main() {
    vec4 resultantColour;

    vec2 indexCoords = floor(coords);
    float fractX = fract(vTextureCoord.x * du);
    float fractY = fract(vTextureCoord.y * dv);
    float blendX = smoothstep(0.99, 1.0, fractX);
    float blendY = smoothstep(0.99, 1.0, fractY);

   if(isSelected == 0.0)
        resultantColour = cs;
   else if ((mod(indexCoords.x, 2.0) == 0.0 && mod(indexCoords.y, 2.0) == 0.0) || (mod(indexCoords.x, 2.0) == 1.0 && mod(indexCoords.y, 2.0) == 1.0)){
         vec4 aux =  mix(c1, c2, blendX);
         resultantColour = mix(aux, c2, blendY);
   }
   else{
        vec4 aux =  mix(c2, c1, blendX);
        resultantColour = mix(aux, c1, blendY);

   }

	vec4 color = texture2D(uSampler, vTextureCoord);
	gl_FragColor = color * resultantColour;
}
