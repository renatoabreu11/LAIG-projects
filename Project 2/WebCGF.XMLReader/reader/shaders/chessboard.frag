#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;
uniform float du;
uniform float dv;

void main() {
    vec2 position = vTextureCoord * vec2(du, dv);
    vec2 cell = floor(position);
    vec2 result = mod(position, vec2(2.0, 2.0));
    vec4 resultantColour;
    if(result.x > 0.1 && result.y > 0.1)
        resultantColour = c1;
    else resultantColour = c2;

	vec4 color = texture2D(uSampler, vTextureCoord);
	gl_FragColor = color * resultantColour;
}
