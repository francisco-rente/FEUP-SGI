import {MyPatch} from "../../primitives/MyPatch.js";
import {MyCylinder} from "../../primitives/MyCylinder.js";

export class MyPieceView {

    static circleControlPoints = [
        [1, 0, 0, 1],
        [1, -0.6666, 0, 1],
        [0, -0.6666, 0, 1],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0.6666, 0, 1],
        [0, 0.6666, 0, 1],
        [0, 0, 0, 1],
    ];

    constructor(scene, boardSize) {
        this.scene = scene;
        this.boardSize = boardSize;

        this.pieceTop = new MyPatch(this.scene, "PieceTop", 1, 3,
            20, 20, MyPieceView.circleControlPoints);
        this.pieceSide = new MyCylinder(this.scene, "PieceSide", this.boardSize[0] / 8 / 2, this.boardSize[0] / 8 / 2, 0.5, 20, 20);


    }


    display(position, appearance){
        const [x, y, z] = position;
        const squareSize = this.boardSize[0] / 8;

        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();

        this.scene.pushMatrix();

        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.translate(x, y, z);
        this.pieceSide.display();

        this.scene.pushMatrix();
        this.scene.translate(-squareSize / 2, 0, 0.5);
        this.scene.scale(squareSize, squareSize, 1);
        this.pieceTop.display();

        // display bottom
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.translate(0, 0, 0.5);
        this.pieceTop.display();
        this.scene.popMatrix();
        this.scene.popMatrix();
        this.scene.popMatrix();
        //this.scene.popMatrix();
    }

    displayInBoard(position, appearance, boardOffset=15) {
        const [i, j] = position;
        const squareSize = this.boardSize[0] / 8;


        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();

        this.scene.pushMatrix();

        this.scene.rotate(-Math.PI / 2, 1, 0, 0);

        const x = (i + 0.5) * squareSize + boardOffset;
        const y = (j + 0.5) * squareSize - boardOffset;
        const z = 1;
        this.scene.translate(x, y, z);
        this.pieceSide.display();

        this.scene.pushMatrix();
        this.scene.translate(-squareSize / 2, 0, 0.5);
        this.scene.scale(squareSize, squareSize, 1);
        this.pieceTop.display();
        this.scene.popMatrix();
        this.scene.popMatrix();
    }


}