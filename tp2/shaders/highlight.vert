attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
uniform float timeFactor;
uniform float scaleFactor;


// TODO: what does this mean?
//     <!-- o atributo scale_h define o “fator de escala” –->
//    <!-- no estado extremo da pulsacao –->
//        <!-- Ex: 1.1 representa 110% -->

// should we cutoff the scale at scale_h with an if?
// should we add or multiply the scale factor?


void main() {
    vTextureCoord = aTextureCoord;
    // why is this not smooth?
    // vec3 offset = (timeFactor / 10.0) * scaleFactor * aVertexNormal;

    vec3 offset = mod(timeFactor * 4.0, 5.0) * aVertexNormal;

    vec3 maxOffset = (scaleFactor * aVertexNormal);
    if (offset.x > maxOffset.x) {
        offset = maxOffset;
    }

    // if scaleFactor > scale_h, then offset = 0?
    // if scaleFactor < scale_h, then offset = scaleFactor * aVertexNormal?

    gl_Position = (uPMatrix * uMVMatrix * vec4((aVertexPosition + offset), 1.0));
}