#ifdef GL_ES
precision highp float;
#endif

uniform vec3 colour;
uniform float norm;

void main(){
	float glow = 0.75+norm*-0.25;
    vec3 resultantColour = colour * vec3(glow, glow, glow);
    gl_FragColor = vec4(resultantColour, 0.9);
}
