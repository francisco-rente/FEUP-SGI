export class GameLogic {
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
        this.previousMoves = [];
    }

    getPreviousMoves() {
        return this.previousMoves;
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

        let isKing = this.gameBoard[this.selected[0]][this.selected[1]] === this.playerTurn + 2;

        if((this.selected[0] - x)*(this.playerTurn === 1 ? 1 : -1) <= 0 && !isKing){
            console.log("Invalid move");
            return false;
        }
        

        if(Math.abs(this.selected[1] - y) === 1 && Math.abs(this.selected[0] - x) === 1){ 
            //do nothing
        }
        else{
            let aux_board = this.gameBoard;

            let x_dir = this.selected[0] - x > 0 ? -1 : 1;
            let y_dir = this.selected[1] - y > 0 ? -1 : 1;
            for (let i = this.selected[0] + x_dir, j = this.selected[1] + y_dir; i !== x; i += x_dir, j += y_dir) {
                if (aux_board[i][j] !== 0 && aux_board[i + x_dir][j + y_dir] === 0 && i + x_dir >= 0 && i + x_dir <= 7 && j + y_dir >= 0 && j + y_dir <= 7) {
                    aux_board[i][j] = 0;
                }
                else {
                    console.log("Invalid move");
                    return false;
                }
            }
            this.gameBoard = aux_board;
        }


        if((this.playerTurn === 1 && x === 7) || (this.playerTurn === 2 && x === 0)){
            this.gameBoard[x][y] = this.playerTurn + 2;
        }
        else{
            this.gameBoard[x][y] = this.playerTurn;
        }
        this.selected = [-1, -1];
        this.gameBoard[this.selected[0]][this.selected[1]] = 0;
        this.playerTurn = this.playerTurn === 1 ? 2 : 1;
        this.previousMoves.push([x, y]);
        return this.gameBoard;
    }
}