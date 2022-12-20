import { MyCylinder } from "../../primitives/MyCylinder.js";
import {MyRectangle} from "../../primitives/MyRectangle.js";

/**
 * Board class, creating the objects
 * @constructor
 * @param scene - Reference to MyScene object
 * @param textures - Reference to the textures to be used
 * @param materials - Reference to the materials to be used
 * @param position - Position of the board
 */
export class MyBoardView {
    // order of the elements
    // black square
    // white square
    // black piece
    // white piece

    textures = {};
    materials = {};
    position = [0, 0, 0];
    size = [10, 10, 10];
    board = [];


    // Missing size TODO
    constructor(scene, textures, materials, position, size) {
        this.scene = scene;
        this.initTextures(textures);
        this.initMaterials(materials);
        this.position = position;
        this.size = size;
        this.board = 
    [
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]]

    }

    initMaterials(materials) {
        this.materials["blackSquare"] = materials[0];
        this.materials["whiteSquare"] = materials[1];
        this.materials["blackPiece"] = materials[2];
        this.materials["whitePiece"] = materials[3];
    }

    initTextures(textures) {
        this.textures["blackSquare"] = {"texture": textures[0][0], "length_s": textures[0][1], "length_t": textures[0][2]};
        this.textures["whiteSquare"] = {"texture": textures[1][0], "length_s": textures[1][1], "length_t": textures[1][2]};
        this.textures["blackPiece"] = {"texture": textures[2][0], "length_s": textures[2][1], "length_t": textures[2][2]};
        this.textures["whitePiece"] = {"texture": textures[3][0], "length_s": textures[3][1], "length_t": textures[3][2]};
    }


    display() {
        // let piece = new MyPieceView(this.scene, 0, 0, 1, 1);
        // switch to patches for light improvement
        const square = new MyRectangle(this.scene, "Square", 0, this.size[0] / 8, 0, this.size[1] / 8);

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.scene.pushMatrix();

                let appearance;
                if ((i + j) % 2 === 0) {
                    const texture = this.textures["blackSquare"]["texture"];
                    appearance = this.materials["blackSquare"];
                    appearance.setTexture(texture);
                }
                else {
                    const texture = this.textures["whiteSquare"]["texture"];
                    appearance = this.materials["whiteSquare"];
                    appearance.setTexture(texture);
                }

                appearance.setTextureWrap('REPEAT', 'REPEAT');
                this.scene.pushAppearance(appearance);
                this.scene.applyAppearance();

                this.scene.translate(i * this.size[0] / 8, j * this.size[1] / 8, 0);
                square.display();
                this.scene.popMatrix();
            }
        }

        const pieceSide = new MyCylinder(this.scene, "PieceSide", this.size[0]/8/2, this.size[0]/8/2, 0.5, 20, 20);

        for (let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {

                
                let color = this.board[i][j];
                if(color == 0) continue;
                this.scene.pushMatrix();

                let appearance;
                if (color === 1) {
                    const texture = this.textures["blackPiece"]["texture"];
                    appearance = this.materials["blackPiece"];
                    appearance.setTexture(texture);
                }
                else if(color === 2){
                    const texture = this.textures["whitePiece"]["texture"];
                    appearance = this.materials["whitePiece"];
                    appearance.setTexture(texture);
                }
                else{
                    console.log("Invalid color in piece on "+ [i, j])
                    continue;
                }
                
                appearance.setTextureWrap('REPEAT', 'REPEAT');
                this.scene.pushAppearance(appearance);
                this.scene.applyAppearance();
                //this.scene.translate(i * this.size[1] / 8 + Math.sqrt(this.size[0]/8), j * this.size[1]/8 + Math.sqrt(this.size[1]/8), 0);
                this.scene.translate((i + 0.5) * this.size[1] / 8, (j + 0.5) * this.size[1]/8, 0);  
                pieceSide.display();
                this.scene.popMatrix();
            }
        }
        
    }
}
