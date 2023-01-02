import {MyBoardView} from "../View/MyBoardView.js" 
import {GameLogic} from "./GameLogic.js"
import {MyPlayer} from "./MyPlayer.js"



export class Board{
    constructor(scene, textures, materials,size, boardOffset=15) {
        this.boardView = new MyBoardView(scene, textures, materials, size, boardOffset);

        this.player1 = new MyPlayer("Player 1"); // black pieces
        this.player2 = new MyPlayer("Player 2"); // white pieces

        this.gameLogic = new GameLogic(this.player1, this.player2);
    }

    display(){
        this.boardView.display(this.gameLogic);
    }
}