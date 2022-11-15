import {CGFnurbsSurface, CGFobject, CGFnurbsObject} from '../../lib/CGF.js';

export class MyPatch extends CGFobject {
    constructor(scene, id, degreeU, degreeV, partsU, partsV, controlPoints) {
        super(scene);
        this.id = id;
        this.degreeV = degreeV;
        this.degreeU = degreeU;
        this.partsU = partsU;
        this.partsV = partsV;
        this.controlPoints = controlPoints;
        console.log(this.controlPoints);
        console.log(this.changeArray());

        let surface = new CGFnurbsSurface(this.degreeU, this.degreeV, this.changeArray());
        this.obj = new CGFnurbsObject(this.scene, this.partsU, this.partsV, surface);
        this.initBuffers();
    }


    changeArray() {
        let vertices = [];
        /*let v_vertices = [];
        console.log(this.degreeU, this.degreeV);
        for (let i = 0; i < this.degreeU + 1; i++) {
            v_vertices = [];
            for (let j = 0; j < this.degreeV + 1; j++) {
                v_vertices.push( this.controlPoints[i * (this.degreeV + 1) + j]);
            }
            vertices.push(v_vertices);
        }*/

        // not working
        /*for (let i = 0; i < this.degreeU + 1; i++) {
            vertices.push(this.controlPoints.slice(i * (this.degreeU + 1), (i + 1) * (this.degreeV + 1)));
        }*/

        // does the same as the commented code above
        vertices = [...Array(this.degreeU + 1).keys()].map(i => {
            return [...[...Array(this.degreeV + 1).keys()].map(j =>
                this.controlPoints[i * (this.degreeV +1) + j]
            )]
        });


        return vertices;

    }


    initBuffers() {
        //this.obj.initBuffers();
    }

    updateTexCoords() {
    }

    display() {
        this.obj.display();
    }

    static checkControlPoints(degreeU, degreeV, controlPointsLen) {
        //TODO: check order
        return controlPointsLen === (degreeU + 1) * (degreeV + 1);
    }
}