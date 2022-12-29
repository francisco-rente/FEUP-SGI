import { CGFcamera } from "../../../lib/CGF.js";
import {MyRectangle} from "../../primitives/MyRectangle.js";
import {MyPieceView} from "./MyPieceView.js";
import {MyPatch} from "../../primitives/MyPatch.js";
import {LightingControl} from "./LightingControl.js";


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

        this.lightControl = new LightingControl(this.scene, this.size);
        this.lightControl.createSpotLight(boardOffset);
        this.animatingPieces = [];

        this.cameraAnimationProgress = 1;
    }




    display(gameLogic) {
        this.displayBoardTable(gameLogic);
        this.displayPieces(gameLogic);
        this.displayScoreboard(gameLogic);
        this.displayTimer(gameLogic);
        this.displayPlayerTimers(gameLogic);
        this.displayUndoButton(gameLogic);
        this.displayChangeCameraButton(gameLogic);
        this.displayGameMovieButton(gameLogic);
        this.displayAnimatingPieces(gameLogic);
        this.updateCameraAnimation();
    }

    updateCameraAnimation() {
        if (this.cameraAnimationProgress < 1) {
            this.cameraAnimationProgress += 0.1;
            let pos = vec3.fromValues(0, 0, 0);
            console.log("about to set pos, params are:")
            console.log("pos:"+pos);
            console.log("vec3.fromValues(this.oldCameraPosition) " + vec3.fromValues(this.newCameraPosition[0], this.newCameraPosition[1], this.newCameraPosition[2]));
            console.log("vec3.fromValues(this.newCameraPosition) " + vec3.fromValues(this.newCameraPosition[0], this.newCameraPosition[1], this.newCameraPosition[2]))
            console.log("this.cameraAnimationProgress is " + this.cameraAnimationProgress)

            vec3.lerp(pos, vec3.fromValues(this.oldCameraPosition[0], this.oldCameraPosition[1], this.oldCameraPosition[2]), vec3.fromValues(this.newCameraPosition[0], this.newCameraPosition[1], this.newCameraPosition[2]), this.cameraAnimationProgress);
            console.log("pos is " + pos)
            //new CGFcamera(0.8, 0.1, 500, vec3.fromValues(20, 30, 15), vec3.fromValues(18, 0, 15)),
            this.scene.camera = new CGFcamera(0.8, 0.1, 500, pos, vec3.fromValues(18, 0, 15));
        }
    }

    updateCamera(oldCamera, newCamera) {
        this.oldCameraPosition = oldCamera;
        this.newCameraPosition = newCamera;
        this.cameraAnimationProgress = 0;
    }


    displayUndoButton(gameLogic) {
        const undoButton = new MyRectangle(this.scene, "UndoButton", 0, this.size[0] / 2, 0, this.size[1] / 4);
        this.scene.pushMatrix();
        let texture = this.textures["undo"]["texture"];
        let appearance = this.materials["undo"];
        appearance.setTexture(texture);
        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();
        this.scene.translate(boardOffset, 1, this.size[0]/2 + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.registerForPick(100, undoButton);
        undoButton.display();
        this.scene.clearPickRegistration();
        this.scene.popMatrix();
    }

    displayGameMovieButton(gameLogic) {
        const gameMovieButton = new MyRectangle(this.scene, "GameMovieButton", 0, this.size[0], 0, this.size[1] / 4);
        this.scene.pushMatrix();
        let texture = this.textures["gameMovie"]["texture"];
        let appearance = this.materials["gameMovie"];
        appearance.setTexture(texture);
        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();
        this.scene.translate(boardOffset, 1, (7/8)*this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.registerForPick(102, gameMovieButton);
        gameMovieButton.display();
        this.scene.clearPickRegistration();
        this.scene.popMatrix();
    }


    displayChangeCameraButton(gameLogic) {
        const changeCameraButton = new MyRectangle(this.scene, "ChangeCameraButton", 0, this.size[0] / 2, 0, this.size[1] / 4);
        this.scene.pushMatrix();
        let texture = this.textures["changeCamera"]["texture"];
        let appearance = this.materials["changeCamera"];
        appearance.setTexture(texture);
        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();
        this.scene.translate(this.size[0] * (1/2) + boardOffset, 1, this.size[0]/2 + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.registerForPick(101, changeCameraButton);
        changeCameraButton.display();
        this.scene.clearPickRegistration();
        this.scene.popMatrix();
    }
    displayPlayerTimers(gameLogic) {
        let time = "";
        const timer = new MyRectangle(this.scene, "Timer", 0, this.size[0] / 2, 0, this.size[1] / 4);

        let texture = this.textures["timer"]["texture"];
        let appearance = this.materials["timer"];
        appearance.setTexture(texture);
        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();

        for (let i = 1; i <= 2; i++) {
            if (gameLogic.playerTurn == i) {
                time = gameLogic.getPlayerTime(i);
            } else {
                time = "00:00";
            }

            for (let j = 0; j < 5; j++) {

                if (j == 2) {
                    this.scene.setFontShader([10, 3]);
                } else {
                    this.scene.setFontShaderNumber(time[j]);
                }
                this.scene.pushMatrix();

                if (i == 1) {
                    this.scene.translate((j - 6) * this.size[0] / 4 + boardOffset, 0 + 1, -(1 + 1 / 8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
                } else {
                    this.scene.translate((j + 5) * this.size[0] / 4 + boardOffset, 0 + 1, -(1 + 1 / 8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
                }

                timer.display();
                this.scene.popMatrix();
                this.scene.resetShader();

            }

            if(time[1] == "1"){
                gameLogic.playerTurn == 1 ? gameLogic.playerTurn = 2 : gameLogic.playerTurn = 1;
                gameLogic.changeTurn();
            }
        }


    }

    displayScoreboard(gameLogic) {
        let score = gameLogic.getScore();
        const scoreboard = new MyRectangle(this.scene, "Scoreboard", 0, this.size[0] / 2, 0, this.size[1] / 4);

        let texture = this.textures["timer"]["texture"];
        let appearance = this.materials["timer"];
        appearance.setTexture(texture);
        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();



        for (let i = 0; i < 5; i++) {
            if (i == 2) {
                this.scene.setFontShader([13, 2]);
            } else {
                this.scene.setFontShaderNumber(score[i]);
            }
            this.scene.pushMatrix();

            this.scene.translate((i - 0.5) * this.size[0] / 4 + boardOffset, this.size[0] / 4 + 1, -(1 + 1 / 8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
            scoreboard.display();
            this.scene.popMatrix();
            this.scene.resetShader();
        }


    }

    displayTimer(gameLogic) {
        let time = gameLogic.getElapsedTime();
        const timer = new MyRectangle(this.scene, "Timer", 0, this.size[0] / 2, 0, this.size[1] / 4);



        let texture = this.textures["timer"]["texture"];
        let appearance = this.materials["timer"];
        appearance.setTexture(texture);
        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();


        for (let i = 0; i < 5; i++) {
            if (i == 2) {
                this.scene.setFontShader([10, 3]);
            } else {
                this.scene.setFontShaderNumber(time[i]);
            }
            this.scene.pushMatrix();
            this.scene.translate((i - 0.5) * this.size[0] / 4 + boardOffset, 0 + 1, -(1 + 1 / 8) * this.size[0] + boardOffset); //TODO: tirar o +boardOffset -1 e o +boardOffset
            timer.display();
            this.scene.popMatrix();
            this.scene.resetShader();
        }

        if(time[0] == "5" && time[1] == "9" && time[3] == "5" && time[4] == "9"){
            gameLogic.endGame();
        }

    }

    displayBoardTable(gameLogic) {

        let square;
        square = new MyPatch(
            this.scene, "Square", 1, 1, 20, 20,
            [
                [0, 0, 0, 1],
                [0, this.size[0] / 8, 0, 1],
                [this.size[0] / 8, 0, 0, 1],
                [this.size[0] / 8, this.size[0] / 8, 0, 1],
            ]
        )

        // square = new MyRectangle(this.scene, "Square", 0, this.size[0] / 8, 0, this.size[1] / 8);

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

                if(gameLogic.selected && gameLogic.selected[0] === i && gameLogic.selected[1] === j){
                    this.lightControl.redirectSpotLight([
                        (i + 0.5) * this.size[0] / 8 + boardOffset,
                        -((j+ 0.5) * this.size[1] / 8) + boardOffset,
                    ])
                }

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
            gameLogic.animations.splice(gameLogic.animations.indexOf(animation), 1);
            this.lightControl.reset(true);
        } else {
            offsetX = (final_pos[0] - initial_pos[0]) * current_offset;
            offsetY = (final_pos[1] - initial_pos[1]) * current_offset;
            current_offset -= 0.2;

            this.lightControl.redirectSpotLight([
                (final_pos[0] - offsetX + 0.5) * this.size[0] / 8 + boardOffset,
               -((final_pos[1] - offsetY + 0.5) * this.size[1] / 8) + boardOffset,
            ])

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
                piece["current_offset"] += 0.1;
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
        this.materials["undo"] = materials[9];
        this.materials["changeCamera"] = materials[10];
        this.materials["gameMovie"] = materials[11];
    }

    initTextures(textures) {


        this.textures["blackSquare"] = textures[0];
        this.textures["whiteSquare"] = textures[1];
        this.textures["blackPiece"] = textures[2];
        this.textures["whitePiece"] = textures[3];
        this.textures["blackKing"] = textures[4];
        this.textures["whiteKing"] = textures[5];
        this.textures["board"] = textures[6];
        this.textures["highlighted"] = textures[7];
        this.textures["timer"] = textures[8];
        this.textures["undo"] = textures[9];
        this.textures["changeCamera"] = textures[10];
        this.textures["gameMovie"] = textures[11];

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
