const State = {
    INIT: 0, SELECT_PIECE: 1, SELECT_SQUARE: 2, FORCE_CAPTURE: 3, ANIMATING: 4, ERROR: 1000,
}


export class GameLogic {
    constructor(player1, player2) {
        this.currentState = State.SELECT_PIECE;

        this.gameBoard = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2]];

        this.playerTurn = 1;
        this.player1 = player1;
        this.player2 = player2;
        this.selected = [-1, -1];
        this.possible_moves = []; // Highlighted squares
        this.gameMoves = [];
        this.animations = [];
        this.startTime = new Date();
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

        if (!(this.checkPiece(x, y))) {
            return {"next_state": State.ERROR, "reason": "Not your piece"};
        }
        this.currentState = State.SELECT_SQUARE;
        this.selected = [x, y];

        this.possible_moves = this.getPossibleMovesFromSelection(x, y);
        return {"next_state": this.currentState, "possible_moves": this.possible_moves.slice()};
    }

    isSquareHighlighted(square) {
        const [x, y] = square;
        return this.possible_moves.some((move) => {
            return move["end"][0] === x && move["end"][1] === y;
        });
    }

    getPossibleMovesFromSelection(selectedX, selectedY) {
        let possibleMoves = []; // {begin [x, y], end [x, y], capture false/true}
        let cloneBoard = this.cloneGameBoard();

        let diagonalMoves = this.checkDiagonals(selectedX, selectedY, cloneBoard);
        if (diagonalMoves.length !== 0) {
            possibleMoves = possibleMoves.concat(diagonalMoves.map((move) => {
                return {"begin": [selectedX, selectedY], "end": move, "capture": false}
            }));
        }

        // TODO: if the recursive call is made, a normal diagonal move is not possible
        // TODO: the board should be updated after the move call, for each instance of the move
        let captureMoves = this.checkCaptureMoves(selectedX, selectedY, cloneBoard);
        if (captureMoves.length !== 0) {
            possibleMoves = [];
            possibleMoves = possibleMoves.concat(captureMoves.map((move) => {
                return {"begin": [selectedX, selectedY], "end": move, "capture": false}
            }));
        }

        return possibleMoves;
    }

    checkCaptureMoves(selectedX, selectedY, cloneBoard) {
        let captureMoves = []; //TODO : check if capture is possible

        if (!this.isPieceKing(selectedX, selectedY)) {
            const direction = this.playerTurn === 1 ? 1 : -1;
            for (let i = -1; i <= 1; i += 2) {

                if (this.checkBounds(selectedX + direction, selectedY + i)
                    && this.checkBounds(selectedX + 2 * direction, selectedY + 2 * i)
                    && cloneBoard[selectedX + direction][selectedY + i] !== 0
                    && cloneBoard[selectedX + direction][selectedY + i] !== this.playerTurn
                    && cloneBoard[selectedX + 2 * direction][selectedY + 2 * i] === 0) {
                    captureMoves.push([selectedX + 2 * direction, selectedY + 2 * i]);

                    cloneBoard[selectedX + 2 * direction][selectedY + 2 * i] = this.playerTurn;
                    cloneBoard[selectedX + direction][selectedY + i] = 0;
                    cloneBoard[selectedX][selectedY] = 0;
                    captureMoves = captureMoves.concat(this.checkCaptureMoves(selectedX + 2 * direction, selectedY + 2 * i, this.cloneBoard(cloneBoard)));
                }
            }

            return captureMoves;
        }
    }

    checkDiagonals(x, y, gameBoard) {
        // is not king
        let possibleMoves = [];
        if (!this.isPieceKing(x, y)) {
            const direction = this.playerTurn === 1 ? 1 : -1;
            for (let i = -1; i <= 1; i += 2) {
                if (this.checkBounds(x + direction, y + i) && gameBoard[x + direction][y + i] === 0) {
                    possibleMoves.push([x + direction, y + i]);
                }
            }
        } else {
            for (let i = -1; i <= 1; i += 2)
                for (let j = -1; j <= 1; j += 2)
                    if (this.checkBounds(x + i, y + j) && gameBoard[x + i][y + j] === 0)
                        possibleMoves.push([x + i, y + j]);
        }
        return possibleMoves;
    }


    movePieceFromInput(x, y) {
        const [selectedX, selectedY] = this.selected;
        this.possible_moves = [];

        const move_result = this.movePiece(selectedX, selectedY, x, y);
        if (move_result === State.ERROR) return State.ERROR;

        this.changeTurn();
        this.gameMoves.push({
            "old_pos": [selectedX, selectedY],
            "new_pos": [x, y],
            "player": this.playerTurn,
            "score_increased": move_result["ate"], // TODO: for now, only one piece can be eaten
            "board": this.cloneGameBoard()
        });

    }

    getElapsedTime() {
        let time = new Date();

        let elapsed_minutes = time.getMinutes() - this.startTime.getMinutes();
        let elapsed_seconds = time.getSeconds() - this.startTime.getSeconds();

        if (elapsed_seconds < 0) {
            elapsed_minutes--;
            elapsed_seconds += 60;
        }

        if (elapsed_minutes < 10) elapsed_minutes = "0" + elapsed_minutes;
        if (elapsed_seconds < 10) elapsed_seconds = "0" + elapsed_seconds;
        
        return elapsed_minutes + ":" + elapsed_seconds;
    }

// TODO: ver quando queremos comer várias peças
// TODO: add scoreboard updates in case of capture
// TODO: something has to pass to boardView to force the player to eat
    movePiece(selectedX, selectedY, x, y) {
        console.log("Turn: " + this.playerTurn);

        if (!this.checkMovePieceConditions(selectedX, selectedY, x, y)) {
            console.log("invalid move");
            return State.ERROR;
        }

        const dx = (selectedX - x);
        const dy = (selectedY - y);
        if (dx * dy === 0) return State.ERROR;

        let ate = 0;
        if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
            ate = this.eatPiece(selectedX, selectedY, dx, dy, this.gameBoard);
            if (ate === State.ERROR) return State.ERROR;
            if (ate !== 0) this.incrementScore(this.playerTurn, ate); else return State.ERROR; // no capture was made from a [2,2] move
        }

        if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2)
            this.moveSelectedPiece(selectedX, selectedY, x, y, this.gameBoard);
        else
            return State.ERROR;

        this.animations.push({
            "initial_pos": [selectedX, selectedY],
            "final_pos": [x, y],
            "current_offset": 1,
        }); 

        
        return {"gameBoard": this.gameBoard, "ate": ate};
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

    moveSelectedPiece(selected_x, selected_y, x, y, gameBoard) {
        this.fillSquare(x, y, gameBoard);
        gameBoard[selected_x][selected_y] = 0;
        this.selected = [-1, -1];
    }


    fillSquare(x, y, gameBoard) {
        if ((this.playerTurn === 1 && x === 7) || (this.playerTurn === 2 && x === 0)) {
            gameBoard[x][y] = this.playerTurn + 2; // turn to king
        } else {
            gameBoard[x][y] = this.playerTurn;
        }
    }


    checkBounds(x, y) {
        return (0 <= x && x <= 7 && 0 <= y && y <= 7);
    }

    cloneGameBoard() {
        return this.cloneBoard(this.gameBoard);
    }

    cloneBoard(board) {
        return board.map((arr) => {
            return arr.slice();
        })
    }

}