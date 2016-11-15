#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

varying vec4 finalColour;
uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);
	gl_FragColor = color * finalColour;
}
