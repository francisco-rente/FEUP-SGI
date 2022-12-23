const State = {
    INIT: 0,
    SELECT_PIECE: 1,
    SELECT_SQUARE: 2,
    FORCE_CAPTURE: 3,
    ANIMATING: 3,
    ERROR: 1000,
}


export class GameLogic {
    constructor(player1, player2) {
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
        this.gameMoves = [];
    }


    getBoard() {
        return this.gameBoard;
    }

    getSelected() {
        return this.selected;
    }

    checkPiece(x, y) {
        return (this.gameBoard[x][y] === this.playerTurn || this.gameBoard[x][y] === this.playerTurn + 2);
    }

    selectPiece(x, y) {


        // TODO: has to force the player to eat if possible and return it

        if (!(this.checkPiece(x, y))) {
            console.log("not a piece");
            return State.ERROR;
        }
        this.currentState = State.SELECT_SQUARE;
        this.selected = [x, y];

        // TODO: has to return possible moves (highlight squares)

        return this.currentState;
    }


    //TODO: ver quando queremos comer várias peças
    //TODO: add scoreboard updates in case of capture
    movePiece(x, y) {
        console.log("movePiece", x, y);
        const [selectedX, selectedY] = this.selected;
        if (!this.checkMovePieceConditions(selectedX, selectedY, x, y)) {
            console.log("invalid move");
            return State.ERROR;
        }

        const dx = (this.selected[0] - x);
        const dy = (this.selected[1] - y);
        console.log("dx, dy", dx, dy);
        if (dx * dy === 0) return State.ERROR;

        let ate = 0;
        if (Math.abs(dx) > 1 && Math.abs(dy) > 1) {
            ate = this.eatPiece(selectedX, selectedY, dx, dy, this.gameBoard);
            if (ate === State.ERROR) return State.ERROR;
            if (ate !== 0) this.incrementScore(this.playerTurn, ate);
            else return State.ERROR; // no capture was made from a [2,2] move
        }

        this.moveSelectedPiece(selectedX, selectedY, x, y);
        this.changeTurn();
        this.gameMoves.push({
            "old_pos": [selectedX, selectedY],
            "new_pos": [x, y],
            "player": this.playerTurn,
            "score_increased": ate, // TODO: for now, only one piece can be eaten
            "board": this.cloneGameBoard()
        });


        return this.gameBoard;
    }


    incrementScore(player, score) {
        if (player === 1) this.player1.score += score; else this.player2.score += score;
    }

    eatPiece(selectedX, selectedY, dx, dy, gameBoard) {
        // TODO: maybe should be placed inside moveSelectedPiece
        const x_dir = dx > 0 ? -1 : 1;
        const y_dir = dy > 0 ? -1 : 1;
        const middle_x = selectedX + x_dir;
        const middle_y = selectedY + y_dir;

        if (!this.checkBounds(middle_x + x_dir, middle_y + y_dir)) return State.ERROR;

        if (gameBoard[middle_x][middle_y] !== 0 && gameBoard[middle_x + x_dir][middle_y + y_dir] === 0) {
            // Will eat piece
            gameBoard[middle_x][middle_y] = 0;
            return 1;
        }

        return 0;
    }

    isPieceKing(x, y) {
        return this.gameBoard[x][y] === this.playerTurn + 2;
    }

    checkMovePieceConditions(selectedX, selectedY, x, y) {
        if (selectedX === -1 || selectedY === -1) return false;
        if (this.currentState !== State.SELECT_SQUARE) return false;
        if (!this.checkBounds(x, y) || this.gameBoard[x][y] !== 0) return false;
        const isKing = this.isPieceKing(selectedX, selectedY);
        return !(!isKing && (x - selectedX) * (this.playerTurn === 1 ? 1 : -1) <= 0);
    }

    changeTurn() {
        this.playerTurn = this.playerTurn === 1 ? 2 : 1;
    }

    moveSelectedPiece(selected_x, selected_y, x, y) {
        this.fillSquare(x, y);
        this.gameBoard[selected_x][selected_y] = 0;
        this.selected = [-1, -1];
    }


    fillSquare(x, y) {
        if ((this.playerTurn === 1 && x === 7) || (this.playerTurn === 2 && x === 0)) {
            this.gameBoard[x][y] = this.playerTurn + 2; // turn to king
        } else {
            this.gameBoard[x][y] = this.playerTurn;
        }
    }


    checkBounds(x, y) {
        return (0 <= x <= 7 && 0 <= y <= 7);
    }

    cloneGameBoard() {
        return this.gameBoard.map((arr) => {
            return arr.slice();
        })
    }


}