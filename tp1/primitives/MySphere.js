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
        let stack_angle = Math.PI/(2*this.stacks);
        
        for(let stack = 0; stack <= 2*this.stacks; stack++) {

            let theta =  Math.PI/2 - stack_angle * stack; 
            let z = Math.sin(theta);

            for(let slice = 0; slice <= this.slices; slice++) {
                let phi = slice_angle * slice; 
                
                let x = Math.cos(theta) * Math.cos(phi);
                let y = Math.cos(theta) * Math.sin(phi);
                
                this.vertices.push(
                    this.radius * x,
                    this.radius * y,
                    this.radius * z
                    );

                this.normals.push(x, y, z);
                
          
                this.texCoords.push(
                    slice / this.slices, 
                    stack / (2 * this.stacks)
                    );
              
                if(stack < 2*this.stacks && slice < this.slices) {
                    var index = stack * (this.slices + 1) + slice;
                    this.indices.push(index + 1, index, index + this.slices + 1);
                    this.indices.push(index + this.slices + 2, index + 1, index + this.slices + 1);
                }
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
        this.updateTexCoordsGLBuffers();
    }

};


