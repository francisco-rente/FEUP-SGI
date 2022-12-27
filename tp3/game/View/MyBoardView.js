import {MyRectangle} from "../../primitives/MyRectangle.js";
import {MyPieceView} from "./MyPieceView.js";


const stackingPos = [0, 0, 0];
const boardOffset = 15;

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

        this.stackXYWhite = [this.size[0] / 8 + boardOffset - 2.5 * (this.size[0] / 8), this.size[1] / 8 - boardOffset - 2, 1];
        this.stackXYBlack = [this.size[0] / 8 + boardOffset + this.size[0], this.size[1] / 8 - boardOffset - 2, 1];

        this.animatingPieces = [];
    }


    display(gameLogic) {
        this.displayBoardTable(gameLogic);
        this.displayPieces(gameLogic);
        this.displayScoreboard(gameLogic);
        this.displayTimer(gameLogic);
        this.displayPlayerTimers(gameLogic);
        this.displayAnimatingPieces(gameLogic);
        this.displayAnimatingPieces(gameLogic);
    }

    displayPlayerTimers(gameLogic) {
        let time = "";
        for (let i = 1; i <= 2; i++) {
            if (gameLogic.playerTurn == i) {
                time = gameLogic.getPlayerTime(i);
                console.log(time)
            } else {
                time = "00:00";
            }

            for (let j = 0; j < 5; j++) {
                const timer = new MyRectangle(this.scene, "Timer", 0, this.size[0] / 2, 0, this.size[1] / 4);
                if (j == 2) {
                    this.scene.setFontShader([10, 3]);
                } else {
                    this.scene.setFontShaderNumber(time[j]);
                }
                this.scene.pushMatrix();
                let texture = this.textures["timer"]["texture"];
                let appearance = this.materials["timer"];
                appearance.setTexture(texture);
                this.scene.pushAppearance(appearance);
                this.scene.applyAppearance();
                if (i == 1) {
                    //this.scene.translate((-j-0.5)*this.size[0]/4 + boardOffset, 0 + 1, -(1 + 1/8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
                    this.scene.translate((-j - 3) * this.size[0] / 4 + boardOffset, 0 + 1, -(1 + 1 / 8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
                } else {
                    this.scene.translate((j - 0.5 + 6) * this.size[0] / 4 + boardOffset, 0 + 1, -(1 + 1 / 8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
                    //this.scene.translate((i-0.5)*this.size[0]/4 + boardOffset, 0 + 1, -(1 + 1/8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
                }

                timer.display();
                this.scene.popMatrix();
                this.scene.resetShader();
            }
        }
    }

    displayScoreboard(gameLogic) {
        let score = gameLogic.getScore();
        const scoreboard = new MyRectangle(this.scene, "Scoreboard", 0, this.size[0] / 2, 0, this.size[1] / 4);
        for (let i = 0; i < 5; i++) {
            if (i == 2) {
                this.scene.setFontShader([13, 2]);
            } else {
                this.scene.setFontShaderNumber(score[i]);
            }
            this.scene.pushMatrix();
            let texture = this.textures["timer"]["texture"];
            let appearance = this.materials["timer"];
            appearance.setTexture(texture);
            this.scene.pushAppearance(appearance);
            this.scene.applyAppearance();
            this.scene.translate((i - 0.5) * this.size[0] / 4 + boardOffset, this.size[0] / 4 + 1, -(1 + 1 / 8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
            scoreboard.display();
            this.scene.popMatrix();
            this.scene.resetShader();
        }
    }

    displayTimer(gameLogic) {
        let time = gameLogic.getElapsedTime();
        for (let i = 0; i < 5; i++) {
            const timer = new MyRectangle(this.scene, "Timer", 0, this.size[0] / 2, 0, this.size[1] / 4);
            if (i == 2) {
                this.scene.setFontShader([10, 3]);
            } else {
                this.scene.setFontShaderNumber(time[i]);
            }
            this.scene.pushMatrix();
            let texture = this.textures["timer"]["texture"];
            let appearance = this.materials["timer"];
            appearance.setTexture(texture);
            this.scene.pushAppearance(appearance);
            this.scene.applyAppearance();
            this.scene.translate((i - 0.5) * this.size[0] / 4 + boardOffset, 0 + 1, -(1 + 1 / 8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
            timer.display();
            this.scene.popMatrix();
            this.scene.resetShader();
        }
    }

    displayBoardTable(gameLogic) {
        const square = new MyRectangle(this.scene, "Square", 0, this.size[0] / 8, 0, this.size[1] / 8);

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.scene.pushMatrix();

                const appearance = this.getBoardSquareAppearance(gameLogic, [i, j]);
                if (appearance === null) continue;

                this.scene.pushAppearance(appearance);
                this.scene.applyAppearance();
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.scene.translate(i * this.size[0] / 8 + boardOffset, j * this.size[1] / 8 - boardOffset, 1); //TODO: tirar o +boardOffset -boardOffset e o +1
                this.scene.registerForPick((i + 1) * 10 + (j + 1), square);
                square.display();
                this.scene.clearPickRegistration();
                this.scene.popMatrix();
            }
        }
    }


    displayPieces(gameLogic) {

        const currentBoard = gameLogic.getBoard();

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let color = currentBoard[i][j];

                const appearance = this.getPieceAppearance(color, [i, j]);
                if (appearance === null) continue;
                const newPiece = new MyPieceView(this.scene, this.size);
                this.scene.registerForPick((i + 1) * 10 + (j + 1), newPiece);

                let offsetX = 0, offsetY = 0;
                let animation = gameLogic.animations.find(animation => animation["final_pos"][0] === i && animation["final_pos"][1] === j);
                if (animation !== undefined) [offsetX, offsetY] = this.displayMovingPiece(animation, gameLogic);


                newPiece.displayInBoard([i - offsetX, j - offsetY], appearance);
                this.scene.clearPickRegistration();
            }
        }
    }


    displayMovingPiece(animation, gameLogic) {
        let offsetX, offsetY = 0;
        const initial_pos = animation["initial_pos"];
        const final_pos = animation["final_pos"];
        let current_offset = animation["current_offset"];

        if (current_offset < 0) {
            console.log("animation finished!");
            gameLogic.animations.splice(gameLogic.animations.indexOf(animation), 1);
        } else {
            offsetX = (final_pos[0] - initial_pos[0]) * current_offset;
            offsetY = (final_pos[1] - initial_pos[1]) * current_offset;
            current_offset -= 0.1;

            for (let i = 0; i < gameLogic.animations.length; i++) {
                if (gameLogic.animations[i] === animation) {
                    gameLogic.animations[i]["current_offset"] = current_offset;
                    break;
                }
            }
        }
        return [offsetX, offsetY];
    }


    displayAnimatingPieces(gamelogic) {

        let animatingBlack = 0;
        let animatingWhite = 0;

        for (let piece of gamelogic.capturedPieces) {
            const current_offset = piece["current_offset"];

            const color = piece["color"];
            const isKing = piece["ateKing"];
            const newPiece = new MyPieceView(this.scene, this.size);
            const colorCode = (color === "white" ? 2 : 1);
            const appearance = this.getPieceAppearance(colorCode + (isKing ? 2 : 0), null);

            let initial_pos = piece["initial_pos"];
            let exact_initial_pos = []
            exact_initial_pos[0] = initial_pos[0] * this.size[0] / 8 + boardOffset;
            exact_initial_pos[1] = initial_pos[1] * this.size[1] / 8 - boardOffset;
            exact_initial_pos[2] = 1;


            if (current_offset < 1) {
                let vector = vec3.fromValues(0, 0, 0);
                vec3.lerp(vector, exact_initial_pos,
                    (color === "white" ? this.stackXYWhite : this.stackXYBlack), current_offset);
                vector[2] = (1 + 0.5 * Math.sin(Math.PI * current_offset)) * 4;

                newPiece.display(vector, appearance);
                piece["current_offset"] += 0.01;
                animatingBlack += piece["color"] === "black" ? 1 : 0;
                animatingWhite += piece["color"] === "white" ? 1 : 0;
            }
        }

        this.stackCapturedPieces(gamelogic, {
            "black": animatingBlack,
            "white": animatingWhite
        });
    }


    stackCapturedPieces(gamelogic, animating) {

        const whiteStillAnimating = animating["white"];
        const blackStillAnimating = animating["black"];

        const [stackCountWhite, stackCountBlack] = gamelogic.getScore(false);

        for (let i = 0; i < stackCountBlack - blackStillAnimating; i++) {
            const newPiece = new MyPieceView(this.scene, this.size);
            const appearance = this.getPieceAppearance(1, null);
            this.stackXYBlack[2] = i * 0.5;
            newPiece.display(this.stackXYBlack, appearance);
        }

        for (let i = 0; i < stackCountWhite - whiteStillAnimating; i++) {
            const newPiece = new MyPieceView(this.scene, this.size);
            const appearance = this.getPieceAppearance(2, null);
            this.stackXYWhite[2] = i * 0.5;
            newPiece.display(this.stackXYWhite, appearance);
        }
    }

    initMaterials(materials) {
        this.materials["blackSquare"] = materials[0];
        this.materials["whiteSquare"] = materials[1];
        this.materials["blackPiece"] = materials[2];
        this.materials["whitePiece"] = materials[3];
        this.materials["blackKing"] = materials[4];
        this.materials["whiteKing"] = materials[5];
        this.materials["board"] = materials[6];
        this.materials["highlighted"] = materials[7];
        this.materials["timer"] = materials[8];
    }

    initTextures(textures) {


        this.textures["blackSquare"] = textures[0]
        this.textures["whiteSquare"] = textures[1]
        this.textures["blackPiece"] = textures[2]
        this.textures["whitePiece"] = textures[3]
        this.textures["blackKing"] = textures[4]
        this.textures["whiteKing"] = textures[5]
        this.textures["board"] = textures[6]
        this.textures["highlighted"] = textures[7]
        this.textures["timer"] = textures[8]

    }


    getBoardSquareAppearance(gameLogic, square) {
        const [i, j] = square;
        let appearance;
        let texture;

        if (gameLogic.isSquareHighlighted(square)) {
            texture = this.textures["highlighted"]["texture"];
            appearance = this.materials["highlighted"];
            appearance.setTexture(texture);
        } else if ((i + j) % 2 === 0) {
            texture = this.textures["blackSquare"]["texture"];
            appearance = this.materials["blackSquare"];
            appearance.setTexture(texture);
        } else {
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
                console.log("Invalid piece on " + square)
                return null;
        }

        appearance.setTextureWrap('REPEAT', 'REPEAT');
        return appearance;
    }


}
