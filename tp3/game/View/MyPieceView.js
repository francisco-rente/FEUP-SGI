import {MyPatch} from "../../primitives/MyPatch.js";
import {MyCylinder} from "../../primitives/MyCylinder.js";

export class MyPieceView {

    static circleControlPoints = [
        [1.0, 0, 0.0],
        [1.0, 0.6666, 0.0],
        [0.0, 0.6666, 0.0],
        [0.0, 0.0, 0.0],
        [1.0, 0, 0.0],
        [1.0, -0.6666, 0.0],
        [0.0, -0.6666, 0.0],
        [0.0, 0.0, 0.0]
    ];

    constructor(scene, boardSize) {
        this.scene = scene;
        this.boardSize = boardSize;
    }


    display(position, appearance) {
        const pieceTop = new MyPatch(this.scene, "PieceTop", 1, 3, 20, 20, MyPieceView.circleControlPoints);
        const pieceSide = new MyCylinder(this.scene, "PieceSide", this.boardSize[0]/8/2, this.boardSize[0]/8/2, 0.5, 20, 20);
        const [i, j] = position;

        this.scene.pushAppearance(appearance);
        this.scene.applyAppearance();

        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        //TODO: tirar o +15 -15 e o +1
        this.scene.translate((i + 0.5) * this.boardSize[1] / 8 + 15, (j + 0.5) * this.boardSize[1]/8 - 15, 1);
        pieceSide.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate((i + 0.5) * this.boardSize[1] / 8, (j + 0.5) * this.boardSize[1]/8, 1);
        pieceTop.display();
        this.scene.popMatrix();
    }


}