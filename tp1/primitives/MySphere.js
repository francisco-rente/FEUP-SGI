import { CGFobject } from '../../lib/CGF.js';
/**
 * Sphere
 * @constructor
 * @param scene 
 * @param radius 
 * @param slices 
 * @param stacks
 */
export class MySphere extends CGFobject {
    constructor(scene, id, radius, slices, stacks)
    {
        super(scene);
        this.slices = Math.ceil(slices);
        this.stacks = Math.ceil(stacks);
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
            let stack_angle_cos = Math.cos(stack_angle*i);
            let stack_angle_sin = Math.sin(stack_angle*i);
            for(let j = 0; j <= this.stacks; ++j) {

                let slice_angle_cos = Math.cos(slice_angle*j);
                let slice_angle_sin = Math.sin(slice_angle*j);

                this.vertices.push(
                    this.radius*slice_angle_cos*stack_angle_cos, 
                    this.radius*slice_angle_cos*stack_angle_sin, 
                    this.radius*slice_angle_sin
                );
 
                this.normals.push(
                    slice_angle_cos*stack_angle_cos,
                    slice_angle_cos*slice_angle_sin, 
                    slice_angle_sin
                );
                this.texCoords.push(
                    i / this.slices,
                    1 - j / this.stacks
                );
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
     * Updates the list of texture coordinates of the sphere
     * @param {Array} coords - Array of texture coordinates
     */
    updateTexCoords(coords) {
        this.updateTexCoordsGLBuffers();
    }

};