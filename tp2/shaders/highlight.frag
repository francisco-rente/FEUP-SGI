#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform float timeFactor;
uniform sampler2D uSampler;
uniform vec3 color;

void main() {
    vec4 textureColor =  texture2D(uSampler, vTextureCoord);

    //TODO: mix color with other stuff (maybe use timeFactor) to make it smoother
    // and similiar to the example
    gl_FragColor =  mix (textureColor, vec4(color, 1.0), timeFactor);
}