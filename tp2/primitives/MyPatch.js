import { CGFnurbsSurface, CGFobject, CGFnurbsObject } from '../../lib/CGF.js';

export class MyPatch extends CGFobject{
    constructor(scene, id, degreeV, degreeU, partsU, partsV, controlPoints){
        super(scene);
        this.id = id;
        this.degreeV = degreeV;
        this.degreeU = degreeU;
        this.partsU = partsU;
        this.partsV = partsV;
        this.controlPoints = controlPoints;
        this.initBuffers();

        console.log(this.controlPoints);
        console.log(this.controlPoints[0][0]);


/*       
        this.auxControlPoints = [];
        for (let i = 0; i < this.degreeU; i++) {
            let aux = [];

            for (let j = 0; j < this.degreeU; j++) {
                console.log(this.controlPoints[i*this.degreeV + j][0]);
                aux.push([this.controlPoints[i * this.degreeV + j][0],
                    this.controlPoints[i * this.degreeV+ j][1],
                    this.controlPoints[i * this.degreeV+ j][2],
                    this.controlPoints[i * this.degreeV + j][3]
                ]);
            }
            this.auxControlPoints.push(aux);
        }
*/

        let points = new Array(this.degreeU);
        for ( let u = 0; u < points.length; u++) {
            points[u] = new Array(this.degreeV);
        }

        for (let u=0; u<this.degreeU; u++){
            for (let v=0; v<this.degreeV; v++){
                points[u][v]=this.controlPoints[u*this.degreeV+v];
                points[u][v].push(...[1]);
            }
        }



        let surface = new CGFnurbsSurface(this.degreeU-1, this.degreeV-1, points);
        this.obj = new CGFnurbsObject(this.scene, this.partsU, this.partsV, surface);
    }
/*
    initBuffers() {
        for(let u = 0; u < this.npointsU; ++u){
            for(let v = 0; v < this.npointsV; ++v){
                this.controlPoints[u][v].push(1);
            }
        }
    }
    */
    initBuffers() {
        //this.obj.initBuffers();
    }

    updateTexCoords(){
    }

    display(){
        this.obj.display();
    }

}