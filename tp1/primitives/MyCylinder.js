import { CGFobject } from '../../lib/CGF.js';
/**
 * Cylinder
 * @constructor
 * @param scene
 * @param slices 
 * @param stacks
 * @param height
 * @param base
 * @param top
 */
export class MyCylinder extends CGFobject {
	constructor(scene, id, base, top, height, slices, stacks) {
		super(scene);
		this.slices = slices;
		this.stacks = stacks;
		this.height = height;
		this.base = base;
		this.top = top;
        
		this.initBuffers();
	};

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		let slice_angle = 2*Math.PI/this.slices;

		let stack_increment = this.height/this.stacks;
		let stack_distance = (this.top - this.base)/this.stacks;

		// Cylinder
		for(let i = 0; i <= this.slices; ++i) {
			let slice_angle_cos = Math.cos(slice_angle*i);
			let slice_angle_sin = Math.sin(slice_angle*i);
			for(let j = 0; j <= this.stacks; ++j) {

				this.vertices.push(
					(this.base + stack_distance*j) * slice_angle_cos, 
					(this.base + stack_distance*j) * slice_angle_sin, 
					j*stack_increment
				);

				this.texCoords.push(
					i*1/this.slices, 
					1 - (j*1/this.stacks)
				);

				this.normals.push(
					slice_angle_cos, 
					slice_angle_sin,
					0
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

    updateTexCoords(coords) {
        const s_l = coords[0];
        const t_l = coords[1];
        this.texCoords = []; // empty texCoords array
        //TODO:verify the Math
        // decrease by s' and t' the length of the current texture coordinates
        for (let i = 0; i <= this.slices; ++i) for (let j = 0; j <= this.stacks; ++j)
            this.texCoords.push(
                s_l * i / this.slices,
                t_l * (1 - j/ this.stacks)
            );

        /*for(let i = 0; i < this.texCoords.length; i += 2) {
            this.texCoords[i] *= s_l;
            this.texCoords[i + 1] *= t_l;
        }*/


        this.updateTexCoordsGLBuffers();
    }

}