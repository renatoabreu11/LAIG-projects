#ifdef GL_ES
precision highp float;
#endif

uniform vec3 colour;

void main(){
    vec3 resultantColour = colour * vec3(0.2, 0.4, 0.5);
    gl_FragColor = vec4(resultantColour, 0.9);
}
