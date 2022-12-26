import {MyBoardView} from "../View/MyBoardView.js" 
import {GameLogic} from "./GameLogic.js"
import {MyPlayer} from "./MyPlayer.js"



export class Board{
    constructor(scene, textures, materials, position, size) {
        console.log("Board constructor");
        console.log("textures: " + textures);
        console.log("TEXTURE IN BOARD CONSTU")
        for (let texture of textures) {
            console.log(texture);
        }

        this.boardView = new MyBoardView(scene, textures, materials, position, size);

        this.player1 = new MyPlayer("Player 1"); // black pieces
        this.player2 = new MyPlayer("Player 2"); // white pieces

        this.gameLogic = new GameLogic(this.player1, this.player2);
    }

    display(){
        this.boardView.display(this.gameLogic);
    }
}