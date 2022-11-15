#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform float timeFactor;
uniform sampler2D uSampler;
uniform vec3 color;

void main() {
    vec4 textureColor =  texture2D(uSampler, vTextureCoord);
    gl_FragColor =  mix (textureColor, vec4(color, 1.0), timeFactor);
}