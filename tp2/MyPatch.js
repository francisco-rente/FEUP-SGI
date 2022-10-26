import { CGFobject } from "../lib/CGF";

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
    }

}