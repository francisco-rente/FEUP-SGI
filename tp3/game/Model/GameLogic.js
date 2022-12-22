// enum State
const State = {
    INIT: 0,
    SELECT_PIECE: 1,
    SELECT_SQUARE: 2,
    ANIMATING: 3,
    ERROR: 4,
}


export class GameLogic {
    constructor() {
        this.currentState = State.SELECT_PIECE;
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
        this.scoreBoard = [0, 0];
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

        console.log([x, y]);
        console.log(this.gameBoard[x][y]);

        console.log(this.playerTurn);
        console.log(this.gameBoard[x][y])

        if (!(this.gameBoard[x][y] === this.playerTurn || this.gameBoard[x][y] === this.playerTurn + 2)) {

            console.log("Invalid piece, setting selected to " + this.selected);
            return State.ERROR;
        }

        this.currentState = State.SELECT_SQUARE;
        this.selected = [x, y];
        return this.currentState;
    }

    deSelectPiece() {
        this.selected = [-1, -1];
    }

    //TODO: ver quando queremos comer várias peças
    //TODO: add scoreboard updates in case of capture
    movePiece(x, y) {
        console.log("movePiece" + this.selected + " " + [x, y]);


        if (this.selected[0] === -1 || this.selected[1] === -1) return State.ERROR;

        if (this.currentState !== State.SELECT_SQUARE) return State.ERROR;
        if (!this.checkBounds(x, y) || this.gameBoard[x][y] !== 0) return State.ERROR;

        const isKing = this.gameBoard[this.selected[0]][this.selected[1]] === this.playerTurn + 2;
        if ((x - this.selected[0]) * (this.playerTurn === 1 ? 1 : -1) <= 0 && !isKing) return State.ERROR;


        if (!(Math.abs(this.selected[1] - y) === 1 && Math.abs(this.selected[0] - x) === 1)) {
            let aux_board = this.gameBoard;

            const dx = (this.selected[0] - x);
            const dy = (this.selected[1] - y);
            if (dx * dy === 0) return State.ERROR;

            const x_dir = dx - x > 0 ? -1 : 1;
            const y_dir = dy - y > 0 ? -1 : 1;

            console.log("x_dir: " + x_dir);
            console.log("y_dir: " + y_dir);

            for (let i = this.selected[0] + x_dir, j = this.selected[1] + y_dir; i !== x; i += x_dir, j += y_dir) {
                if (aux_board[i][j] !== 0 && aux_board[i + x_dir][j + y_dir] === 0
                    && this.checkBounds(i + x_dir, j + y_dir)) {
                    aux_board[i][j] = 0;
                } else {
                    console.log("Invalid move");
                    return State.ERROR;
                }
            }
            this.gameBoard = aux_board;
        }


        if ((this.playerTurn === 1 && x === 7) || (this.playerTurn === 2 && x === 0)) {
            this.gameBoard[x][y] = this.playerTurn + 2;
        } else {
            this.gameBoard[x][y] = this.playerTurn;
        }
        this.gameBoard[this.selected[0]][this.selected[1]] = 0;
        this.selected = [-1, -1];
        this.playerTurn = this.playerTurn === 1 ? 2 : 1;
        // TODO: a player turn should be associated with the move, a long with a before and after board state
        this.previousMoves.push([x, y]);
        return this.gameBoard;
    }


    checkBounds(x, y) {
        return (0 <= x <= 7 && 0 <= y <= 7);
    }


}