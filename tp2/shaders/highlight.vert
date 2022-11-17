attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;


uniform float timeFactor;
uniform float scaleFactor;


void main() {
    vTextureCoord = aTextureCoord;
    vec3 offset = timeFactor * (scaleFactor) * aVertexNormal;

    gl_Position = (uPMatrix * uMVMatrix * vec4((aVertexPosition + offset), 1.0));
}