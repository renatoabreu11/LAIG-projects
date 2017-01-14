#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
varying float time;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);
    gl_FragColor = color;
}
