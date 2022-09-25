import { CGFobject } from '../../lib/CGF.js';
/**
 * MyTorus
 * @constructor
 * @param scene
 * @param inner
 * @param outer
 * @param slices
 * @param loops 
 */
 export class MyTorus extends CGFobject {
	constructor(scene, id, inner, outer, slices, loops) {
		super(scene);
		this.inner = inner;
		this.outer = outer;
		this.slices = slices;
		this.loops = loops;

		this.initBuffers();
	}
	
	initBuffers() {

		this.vertices  = [];
		this.texCoords = [];
		this.normals   = [];


        for(let i = 0; i <= this.loops; ++i){  
			let loop_angle = 2.0*Math.PI*i/this.loops; 

			let s = i/this.loops; 

            let loop_angle_cos = Math.cos(loop_angle);
            let loop_angle_sin = Math.sin(loop_angle);

			for(let j = 0; j <= this.slices; ++j){

				let slice_angle = 2.0*Math.PI*j/this.slices;
                
                let slice_angle_cos = Math.cos(slice_angle);
                let slice_angle_sin = Math.sin(slice_angle);

				
				let x = this.inner*loop_angle_cos*slice_angle_cos + this.outer*loop_angle_cos;  
				let y = this.inner*loop_angle_sin*slice_angle_cos+ this.outer*loop_angle_sin; 
				let z = -this.inner*slice_angle_sin; 
				this.vertices.push(x, y, z); 



				let Nx = -slice_angle_cos*x; 
				let Ny =  slice_angle_cos*(-y); 
				let Nz = -loop_angle_sin*slice_angle_sin*(-y) 
						 +loop_angle_cos*slice_angle_sin*x; 
				let Nr = Math.sqrt(Nx*Nx + Ny*Ny + Nz*Nz); 
				this.normals.push(-Nx/Nr, -Ny/Nr, -Nz/Nr); 

                let t = j/this.slices; 
				this.texCoords.push(s, t); 
			}
		}

		this.indices = [];
		for(let loop = 0; loop < this.loops; ++loop){
			let base1 = (this.slices+1) * loop;
			let base2 = (this.slices+1) * (loop+1);
			for(let i = base1, j = base1 + 1, k = base2, l = base2+1; j < base2; ++i, ++j, ++k, ++l){
				this.indices.push(i, l, k);
				this.indices.push(i, j, l);
			}
		}

        
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

         	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the sphere
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}