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
uniform float su;
uniform float sv;

void main() {
    vec4 resultantColour;

    /* conversion */
    float sx = (su/2.0)+4.0;
    float sy = (sv/2.0)+4.0;

    float x = 0.5*(vTextureCoord.x+1.0); // range [0,1]
    float y = 0.5*(vTextureCoord.y+1.0); // range [0,1]
    /*
    When the fractional part of the x coordinate is lower than 0.5 the shader picks one color,
    otherwise the other color would be picked.

    GLSL has a function that we can use to create the smoth transitions: smoothstep.
    */

    float fractX = fract(x * du);
    float fractY = fract(y * dv);
    float blendX = smoothstep(0.49, 0.5, fractX) *
            (1.0 - smoothstep(0.99, 1.0, fractX));
    float blendY = smoothstep(0.49, 0.5, fractY) *
            (1.0 - smoothstep(0.99, 1.0, fractY));

   if( ((x * du >= sx) && (x * du < sx+.5)) &&
        ((y*dv >= sy) && (y*dv < sy+.5))
    )
        resultantColour = cs;
   else if ((fractX < 0.5) ^^ (fractY < 0.5))
        resultantColour = c1;
   else
        resultantColour = c2;

	vec4 color = texture2D(uSampler, vTextureCoord);
	gl_FragColor = color * resultantColour;
}
