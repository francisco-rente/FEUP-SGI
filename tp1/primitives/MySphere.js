import { CGFobject } from '../../lib/CGF.js';
/**
 * Sphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Radius of the sphere
 * @param slices - Number of stacks of the sphere
 * @param stacks - Number of stacks of the sphere
 */
export class MySphere extends CGFobject {
    constructor(scene, id, radius, slices, stacks)
    {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.radius = radius;
 
        this.initBuffers();
    };
 
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
 
        let slice_angle = 2*Math.PI/this.slices;
        let stack_angle = 2*Math.PI/this.stacks;
 
        for(let i = 0; i <= this.slices; ++i) {
            for(let j = 0; j <= this.stacks; ++j) {
 
                this.vertices.push(
                    this.radius*Math.cos(slice_angle*j)*Math.cos(stack_angle*i), 
                    this.radius*Math.cos(slice_angle*j)*Math.sin(stack_angle*i), 
                    this.radius*Math.sin(slice_angle*j)
                );
 
                this.normals.push(
                    Math.cos(slice_angle*j)*Math.cos(stack_angle*i), 
                    Math.cos(slice_angle*j)*Math.sin(stack_angle*i), 
                    Math.sin(slice_angle*j)
                );
                
                 /*
                 // TODO: divide by 4 instead of 2 (in X)?
                 this.texCoords.push(
                     stack_angle*i / (2*Math.PI),
                     1- ((slice_angle*j + Math.PI/2) / Math.PI)
                 );*/
 
            }
 
        }
 
       for (let i = 0; i < this.slices; ++i) {
            for(let j = 0; j < this.stacks; ++j) {
                this.indices.push(
                    (i+1)*(this.stacks+1) + j, i*(this.stacks+1) + j+1, i*(this.stacks+1) + j,
                    i*(this.stacks+1) + j+1, (i+1)*(this.stacks+1) + j, (i+1)*(this.stacks+1) + j+1
                );
            }
        }
 
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };

     	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}

};