import {CGFobject} from "../lib/CGF.js";
/**
 * Board class, creating the objects
 * @constructor
 * @param scene - Reference to MyScene object
 * @param textures - Reference to the textures to be used
 * @param materials - Reference to the materials to be used
 * @param position - Position of the board
 */
export class MyBoard extends CGFobject {
    constructor(scene, textures, materials, position) {
        super(scene);
        this.scene = scene;
        this.textures = textures;
        this.materials = materials;
        this.position = position;
        /*
        this.board = new MyPlane(scene, 20, 20);
        this.board.initBuffers();
        */
    }
}
