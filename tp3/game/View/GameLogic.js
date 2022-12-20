export class GameLogic {
    board = [];
    constructor() {
        this.gameBoard = [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2]
        ];
        this.playerTurn = 1;
        this.selected = [-1, -1];
    }

    getBoard() {
        return this.gameBoard;
    }

    getPlayerTurn() {
        return this.playerTurn;
    }

    getSelected() {
        return this.selected;
    }
    

    selectPiece(x, y) {
        if (this.gameBoard[x][y] == this.playerTurn || this.gameBoard[x][y] == this.playerTurn + 2) {
            return true;
        }
        return false;
    }

    deSelectPiece() {
        this.selected = [-1, -1];
    }

    //TODO: ver quando queremos comer várias peças
    movePiece(x, y) { //needs to have a piece selected

        if(x < 0 || x > 7 || y < 0 || y > 7 || this.gameBoard[x][y] !== 0){
            console.log("Invalid move");
            return false;
        }

        if(this.gameBoard[this.selectPiece[0]][this.selectPiece[1]] === this.playerTurn){ //if normal piece selected
            if(this.gameBoard[x][y] === 0){ //if moving to empty space
                if(this.selectPiece[0] - x === (this.playerTurn === 1 ? 1 : -1) && Math.abs(this.selectPiece[1] - y) === 1 && this.gameBoard[x][y] === 0){ //simple move
                    this.gameBoard[x][y] = this.playerTurn;
                    this.selectPiece = [-1, -1];
                    this.gameBoard[this.selectPiece[0]][this.selectPiece[1]] = 0;
                    this.playerTurn = this.playerTurn === 1 ? 2 : 1;
                }
                //TODO: juntar os reis e os não reis?
                //TODO: comer peças (nota: posso comer várias numa só jogada)

        }
        else if(this.gameBoard[this.selectPiece[0]][this.selectPiece[1]] === this.playerTurn + 2){ //if king selected
            if(Math.abs(this.selectPiece[1] - y) === 1 && this.gameBoard[x][y] === 0){ //simple move
                this.gameBoard[x][y] = this.playerTurn;
                this.selectPiece = [-1, -1];
                this.gameBoard[this.selectPiece[0]][this.selectPiece[1]] = 0;
                this.playerTurn = this.playerTurn === 1 ? 2 : 1;
            }
            //TODO: comer peças (nota: posso comer várias numa só jogada)
        }
        else{ //if enemy or no piece selected
            console.log("Invalid piece selection")
            return false;
        }
            
        return this.gameBoard;
    }
    }
}