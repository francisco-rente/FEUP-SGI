#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform float timeFactor;
uniform sampler2D uSampler;
uniform vec3 color;

void main() {
    vec4 textureColor =  texture2D(uSampler, vTextureCoord);

    //TODO: how to add the default material color as the texture color?
    // if vTextureCoord is null then use material color?

    gl_FragColor =  mix (textureColor, vec4(color, 1.0), timeFactor);
}