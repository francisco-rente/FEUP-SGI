import { MyCylinder } from "../../primitives/MyCylinder.js";
import { MyPatch } from "../../primitives/MyPatch.js";
import {MyRectangle} from "../../primitives/MyRectangle.js";
import {GameLogic} from "./GameLogic.js";

/**
 * Board class, creating the objects
 * @constructor
 * @param scene - Reference to MyScene object
 * @param textures - Reference to the textures to be used
 * @param materials - Reference to the materials to be used
 * @param position - Position of the board
 */
export class MyBoardView {
    textures = {};
    materials = {};
    position = [0, 0, 0];
    size = [10, 10, 10];
    board = [];


    constructor(scene, textures, materials, position, size) {
        this.scene = scene;
        this.initTextures(textures);
        this.initMaterials(materials);
        this.position = position;
        this.size = size;
        this.logic = new GameLogic();
    }


    display() {
        this.displayBoardTable();
        this.displayPieces();
    }



    displayBoardTable() {
        const square = new MyRectangle(this.scene, "Square", 0, this.size[0] / 8, 0, this.size[1] / 8);

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.scene.pushMatrix();

                const appearance = this.getBoardSquareAppearance([i, j]);
                if(appearance === null) continue;

                this.scene.pushAppearance(appearance);
                this.scene.applyAppearance();
                this.scene.translate(i * this.size[0] / 8, j * this.size[1] / 8, 0);
                square.display();
                this.scene.popMatrix();
            }
        }
    }



    displayPieces() {
        const pieceSide = new MyCylinder(this.scene, "PieceSide", this.size[0]/8/2, this.size[0]/8/2, 0.5, 20, 20);

        for (let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                let color = this.logic.getBoard()[i][j];
                this.scene.pushMatrix();
                const appearance = this.getPieceAppearance(color, [i, j]);
                if(appearance === null) continue;

                this.scene.pushAppearance(appearance);
                this.scene.applyAppearance();
                this.scene.translate((i + 0.5) * this.size[1] / 8, (j + 0.5) * this.size[1]/8, 0);
                this.scene.registerForPick((i + 1) * 10 + (j + 1), pieceSide); //100 para o caso de i = 0 e j = 0
                pieceSide.display();
                //console.log("Registering for pick: " + (100 + i * 10 + j) + " at " + [i, j]);
                this.scene.popMatrix();
            }
        }

        // TODO: This should not be here, but it works
        // Maybe as you suggested, we should set not pickable to everything else
        this.scene.clearPickRegistration();


        const pieceTop = new MyPatch(this.scene, "PieceTop", 1, 3, 20, 20, [
            [1.0, 0, 0.0],
            [1.0, 0.6666, 0.0],
            [0.0, 0.6666, 0.0],
            [0.0, 0.0, 0.0],
            [1.0, 0, 0.0],
            [1.0, -0.6666, 0.0],
            [0.0, -0.6666, 0.0],
            [0.0, 0.0, 0.0]

        ])


        for (let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                let color = this.logic.getBoard()[i][j];
                this.scene.pushMatrix();

                const appearance = this.getPieceAppearance(color, [i, j]);
                if(appearance === null) continue;

                this.scene.pushAppearance(appearance);
                this.scene.applyAppearance();
                this.scene.translate((i + 0.5) * this.size[1] / 8, (j + 0.5) * this.size[1]/8, 0);
                pieceTop.display();
                this.scene.popMatrix();
            }
        }
    }





    initMaterials(materials) {
        this.materials["blackSquare"] = materials[0];
        this.materials["whiteSquare"] = materials[1];
        this.materials["blackPiece"] = materials[2];
        this.materials["whitePiece"] = materials[3];
        this.materials["blackKing"] = materials[4];
        this.materials["whiteKing"] = materials[5];
    }

    initTextures(textures) {
        this.textures["blackSquare"] = {"texture": textures[0][0], "length_s": textures[0][1], "length_t": textures[0][2]};
        this.textures["whiteSquare"] = {"texture": textures[1][0], "length_s": textures[1][1], "length_t": textures[1][2]};
        this.textures["blackPiece"] = {"texture": textures[2][0], "length_s": textures[2][1], "length_t": textures[2][2]};
        this.textures["whitePiece"] = {"texture": textures[3][0], "length_s": textures[3][1], "length_t": textures[3][2]};
        this.textures["blackKing"] = {"texture": textures[4][0], "length_s": textures[4][1], "length_t": textures[4][2]};
        this.textures["whiteKing"] = {"texture": textures[5][0], "length_s": textures[5][1], "length_t": textures[5][2]};
    }


    getBoardSquareAppearance(square) {
        const [i, j] = square;
        let appearance;
        let texture;

        if ((i + j) % 2 === 0) {
            texture = this.textures["blackSquare"]["texture"];
            appearance = this.materials["blackSquare"];
            appearance.setTexture(texture);
        }
        else {
            texture = this.textures["whiteSquare"]["texture"];
            appearance = this.materials["whiteSquare"];
        }
        appearance.setTexture(texture);
        appearance.setTextureWrap('REPEAT', 'REPEAT');

        return appearance;
    }


    getPieceAppearance(color, square) {
        let appearance;
        let texture;

        switch (color) {
            case 1:
                texture = this.textures["blackPiece"]["texture"];
                appearance = this.materials["blackPiece"];
                appearance.setTexture(texture);
                break;

            case 2:
                texture = this.textures["whitePiece"]["texture"];
                appearance = this.materials["whitePiece"];
                appearance.setTexture(texture);
                break;

            case 3:
                texture = this.textures["blackKing"]["texture"];
                appearance = this.materials["blackKing"];
                appearance.setTexture(texture);
                break;

            case 4:
                texture = this.textures["whiteKing"]["texture"];
                appearance = this.materials["whiteKing"];
                appearance.setTexture(texture);
                break;

            case 0:
                return null;

            default:
                console.log("Invalid piece on "+ square)
                return null;
        }

        appearance.setTextureWrap('REPEAT', 'REPEAT');
        return appearance;
    }



}
