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

			for(let j = 0; j <= this.stacks; ++j) {

				this.vertices.push(
					(this.base + stack_distance*j) * Math.cos(slice_angle*i), 
					(this.base + stack_distance*j) * Math.sin(slice_angle*i), 
					j*stack_increment
				);

				this.texCoords.push(
					i*1/this.slices, 
					1 - (j*1/this.stacks)
				);

				this.normals.push(
					Math.cos(slice_angle*i), 
					Math.sin(slice_angle*i), 0
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
};