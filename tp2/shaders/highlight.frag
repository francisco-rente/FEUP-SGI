#version 300 es
precision highp float;

in vec4 vFinalColor;
in vec2 vTextureCoord;
out vec4 fragColor;
uniform sampler2D uSampler;
uniform bool uUseTexture;
uniform float timeFactor;
uniform vec3 color;

void main() {
    if (uUseTexture)
    {
        vec4 textureColor = texture(uSampler, vTextureCoord);
        fragColor = mix(textureColor,vec4(color, 1.0), timeFactor);
    }
    else
    fragColor = mix(vFinalColor,vec4(color, 1.0), timeFactor);
}