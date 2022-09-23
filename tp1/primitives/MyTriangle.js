import {CGFobject} from '../../lib/CGF.js';


class Vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param [x1, y1, z1] - First vertex
 * @param [x2, y2, z2] - Second vertex
 * @param [x3, y3, z3] - Third vertex
 */
export class MyTriangle extends CGFobject {
    constructor(scene, id, [x1, y1, z1], [x2, y2, z2], [x3, y3, z3]) {
        super(scene);
        this.v1 = new Vertex(x1, y1, z1);
        this.v2 = new Vertex(x2, y2, z2);
        this.v3 = new Vertex(x3, y3, z3);
        this.initBuffers();
    };

    initBuffers() {

        /*            v3

            v1              v2
        */

        this.vertices = [
            this.v1.x, this.v1.y, this.v1.z, // 0
            this.v2.x, this.v2.y, this.v2.z, // 1
            this.v3.x, this.v3.y, this.v3.z  // 2
        ];

        this.indices = [
            0, 1, 2
        ]

        // All normals are the same
        // Calculate normal by cross product of two vectors (normal to the plane)
        // DOUBT: is it better to make all normals 0,0,1 and then use z translations for each triangle?
        let v1 = [this.v1.x - this.v2.x, this.v1.y - this.v2.y, this.v1.z - this.v2.z];
        let v2 = [this.v1.x - this.v3.x, this.v1.y - this.v3.y, this.v1.z - this.v3.z];
        let normal = [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
        this.normals = [
            normal[0], normal[1], normal[2],
            normal[0], normal[1], normal[2],
            normal[0], normal[1], normal[2]
        ];

        // Texture mapping math
        // a = |v2 - v1|
        // b = |v3 - v1|
        // c = |v3 - v2|

        this.a = Math.sqrt(Math.pow(this.v2.x - this.v1.x, 2) +
            Math.pow(this.v2.y - this.v1.y, 2) + Math.pow(this.v2.z - this.v1.z, 2));
        this.b = Math.sqrt(Math.pow(this.v3.x - this.v2.x, 2) +
            Math.pow(this.v3.y - this.v2.y, 2) + Math.pow(this.v3.z - this.v2.z, 2));
        this.c = Math.sqrt(Math.pow(this.v1.x - this.v3.x, 2) +
            Math.pow(this.v1.y - this.v3.y, 2) + Math.pow(this.v1.z - this.v3.z, 2));


        this.cosA = (Math.pow(this.a, 2) - Math.pow(this.b, 2) + Math.pow(this.c, 2)) / (2 * this.a * this.c);
        this.sinA = Math.sqrt(1 - Math.pow(this.cosA, 2));
        this.cosB = (Math.pow(this.a, 2) + Math.pow(this.b, 2) - Math.pow(this.c, 2)) / (2 * this.a * this.b);
        this.cosG = (-Math.pow(this.a, 2) + Math.pow(this.b, 2) + Math.pow(this.c, 2)) / (2 * this.b * this.c);


        this.texCoords = [
            0, 0,
            this.a, 0,
            this.c * this.cosA, this.c * this.sinA
        ]


        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };

    /**
     * @method updateTexCoords
     * Updates the list of texture coordinates of the rectangle
     * @param {Array} coords - Array of texture coordinates
     */
    updateTexCoords(coords) {
        // Supposing coords[0] = u, coords[1] = v
        this.texCoords = [
            0, 0,
            this.a / coords[0], 0,
            (this.c * this.cosA) / coords[0], (this.c * this.sinA) / coords[1]
        ]
        this.updateTexCoordsGLBuffers();
    }

}