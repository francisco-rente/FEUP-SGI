export const State = {
    INIT: 0, SELECT_PIECE: 1, SELECT_SQUARE: 2, FORCE_CAPTURE: 3, ERROR: 1000
}


export class GameLogic {
    constructor(player1, player2) {
        this.currentState = State.SELECT_PIECE;
        this.stashedState = State.SELECT_PIECE;

        this.gameBoard = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2]];

        this.playerTurn = 1;
        this.player1 = player1;
        this.player1.time = new Date();
        this.player2 = player2;
        this.selected = [-1, -1];
        this.possible_moves = []; // Highlighted squares
        this.gameMoves = [];
        this.animations = [];
        this.startTime = new Date();
        this.capturedPieces = [];
        this.previousBoard = [];
        this.movesBoard = [
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []]
        ]
    }


    getBoard() {
        return this.gameBoard;
    }

    getScore(string = true) {
        let score = [16, 16];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.gameBoard[i][j] === 1 || this.gameBoard[i][j] === 3) {
                    score[1]--;
                } else if (this.gameBoard[i][j] === 2 || this.gameBoard[i][j] === 4) {
                    score[0]--;
                }
            }
        }

        if (!string) return score;

        score = ("0" + score[0]).slice(-2) + "-" + ("0" + score[1]).slice(-2);
        return score;
    }


    undo() {
        this.gameBoard = this.previousBoard;
        this.playerTurn = this.playerTurn === 1 ? 2 : 1;
        this.gameMoves.pop();
    }

    gameMovie() {
        let aux = this.gameMoves;
        this.resetGame();
        for (let i = 0; i < aux.length; i++) {
            setTimeout(() => {
                this.selectPiece(aux[i].old_pos[0], aux[i].old_pos[1]);
                this.movePieceFromInput(aux[i].new_pos[0], aux[i].new_pos[1]);
            }, 3000 * i);

        }
        this.gameMoves = aux;
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


    getPlayerTime(player) {
        let time = new Date();
        let elapsed_minutes = time.getMinutes();
        let elapsed_seconds = time.getSeconds();
        if (player === 1) {
            elapsed_minutes -= this.player1.time.getMinutes();
            elapsed_seconds -= this.player1.time.getSeconds();
        } else {
            elapsed_minutes -= this.player2.time.getMinutes();
            elapsed_seconds -= this.player2.time.getSeconds();
        }
        if (elapsed_seconds < 0) {
            elapsed_minutes--;
            elapsed_seconds += 60;
        }
        if (elapsed_minutes < 10) elapsed_minutes = "0" + elapsed_minutes;
        if (elapsed_seconds < 10) elapsed_seconds = "0" + elapsed_seconds;
        return elapsed_minutes + ":" + elapsed_seconds;
    }


    changeTurn() {
        if (this.playerTurn === 1) {
            this.player2.time = new Date();
            this.playerTurn = 2;
        } else {
            this.player1.time = new Date();
            this.playerTurn = 1;
        }

        const [player1Score, player2Score] = this.getScore(false);
        if(player1Score === 16){
            alert("Player 1 wins!");
            this.endGame();
        } else if (player2Score === 16){
            alert("Player 2 wins!");
            this.endGame();
        }

        this.getMovesBoard();
        const hasMoves = this.movesBoard.some((row) => {
            return row.some((col) => {
                return col.length > 0
            })
        });

        if(!hasMoves){
            const winner = this.playerTurn === 1 ? "2" : "1";
            alert("Player " + winner  + " wins!");
            this.endGame();
        }
        this.movesBoard = [...Array(8)].map(e => Array(8).fill([]));


    }


    endGame() {
        this.resetGame()
    }


    resetGame() {
        this.currentState = State.SELECT_PIECE;

        this.gameBoard = [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2]];

        this.playerTurn = 1;
        this.player1.time = new Date();
        this.selected = [-1, -1];
        this.possible_moves = []; // Highlighted squares
        this.gameMoves = [];
        this.animations = [];
        this.startTime = new Date();
        this.capturedPieces = [];
        this.previousBoard = [];
    }


    nextState(state) {
        switch (state) {
            case State.SELECT_PIECE:
                this.currentState = State.SELECT_SQUARE;
                break;
            case State.SELECT_SQUARE:
                this.currentState = State.SELECT_SQUARE;
                break;
            case State.FORCE_CAPTURE:
                this.currentState = State.FORCE_CAPTURE;
                break;
            case State.ERROR:
                this.currentState = this.stashedState;
                break;
            default:
                this.currentState = State.ERROR;
        }
    }

    checkPiece(x, y) {
        return (this.gameBoard[x][y] === this.playerTurn || this.gameBoard[x][y] === this.playerTurn + 2);
    }


    selectPiece(x, y) {
        if (!(this.checkPiece(x, y))) this.errorOccurred();
        else {
            this.currentState = State.SELECT_SQUARE;
            this.selected = [x, y];
            this.getPossibleMovesFromSelection(x, y);
        }
    }

    isSquareHighlighted(square) {
        const [x, y] = square;
        const [selected_x, selected_y] = this.selected;
        if (selected_x === -1 || selected_y === -1) return false;

        const possible_squares = this.movesBoard[selected_x][selected_y].map(
            move => move[move.length - 1]
        )

        return possible_squares.some((move) => move[0] === x && move[1] === y);
    }

    getPossibleMovesFromSelection(selectedX, selectedY) {

        // if any of the 3d arrays are not empty, then there are moves

        const hasMoves = this.movesBoard.some((row) => {
            return row.some((col) => {
                return col.length > 0
            })
        })

        if (!hasMoves) {
            this.getMovesBoard();
        }
        return this.movesBoard[selectedX][selectedY];
    }

    getMovesBoard() {
        let canCapture = false;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.movesBoard[i][j] = [];
                if (!canCapture) {
                    this.movesBoard[i][j] = this.movesBoard[i][j].concat(
                        this.checkDiagonals(i, j, this.gameBoard));
                }

                let captureMoves = this.checkCaptureMoves(i, j, this.cloneGameBoard());
                if (captureMoves.length !== 0) {
                    if (!canCapture) {
                        this.movesBoard = [...Array(8)].map(() =>
                            Array(8).fill([]));
                        canCapture = true;
                    }

                    this.movesBoard[i][j] = captureMoves;
                }
            }
        }
    }


    checkCaptureCondition(selectedX, selectedY, i, j, board, playerTurn = this.playerTurn) {
        return this.checkBounds(selectedX + i, selectedY + j)
            && this.checkBounds(selectedX + 2 * i, selectedY + 2 * j)
            && board[selectedX + i][selectedY + j] !== 0
            && (board[selectedX + i][selectedY + j] !== playerTurn && board[selectedX + i][selectedY + j] !== playerTurn + 2)
            && (board[selectedX][selectedY] === playerTurn || board[selectedX][selectedY] === (playerTurn + 2))
            && board[selectedX + 2 * i][selectedY + 2 * j] === 0;
    }


    checkCaptureMoves(selectedX, selectedY, cloneBoard, rec_depth = 0, prev_rec = [[selectedX, selectedY]]) {
        if (rec_depth > 2) return [];

        const direction = this.playerTurn === 1 ? 1 : -1;

        let possibleOffsets;
        if (this.isPieceKing(selectedX, selectedY)) possibleOffsets = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        else possibleOffsets = [[direction, -1], [direction, 1]];


        let captureMoves = [];

        for (let offset of possibleOffsets) {
            const [i, j] = offset;
            if (!this.checkCaptureCondition(selectedX, selectedY, i, j, cloneBoard)) continue;

            const new_moves = prev_rec.concat([[selectedX + 2 * i, selectedY + 2 * j]]);
            captureMoves.push(new_moves);

            cloneBoard[selectedX + 2 * i][selectedY + 2 * j] = this.playerTurn +
                (selectedY + 2 * i === 0 || selectedY + 2 * i === 7 ||
                    this.isPieceKing(selectedX, selectedY, cloneBoard)) * 2;

            cloneBoard[selectedX + i][selectedY + j] = 0;
            cloneBoard[selectedX][selectedY] = 0;

            let recursiveCaptures = this.checkCaptureMoves(selectedX + 2 * direction,
                selectedY + 2 * i, this.cloneBoard(cloneBoard), rec_depth + 1, new_moves);
            if (recursiveCaptures.length !== 0) captureMoves = captureMoves.concat(recursiveCaptures);
        }

        return captureMoves;
    }

    checkDiagonals(x, y, gameBoard) {
        // is not king
        let possibleMoves = [];
        if (!this.isPieceKing(x, y)) {
            const direction = this.playerTurn === 1 ? 1 : -1;
            for (let i = -1; i <= 1; i += 2) {
                if (this.checkBounds(x + direction, y + i) && gameBoard[x + direction][y + i] === 0) {
                    possibleMoves.push([[x, y], [x + direction, y + i]]);
                }
            }
        } else {
            for (let i = -1; i <= 1; i += 2)
                for (let j = -1; j <= 1; j += 2)
                    if (this.checkBounds(x + i, y + j) && gameBoard[x + i][y + j] === 0)
                        possibleMoves.push([[x, y], [x + i, y + j]]);
        }
        return possibleMoves;
    }


    movePieceFromInput(x, y) {
        if (this.selected[0] === -1 && this.selected[1] === -1) {
            return
        }
        const [selectedX, selectedY] = this.selected;
        this.possible_moves = this.movesBoard[selectedX][selectedY];

        let auxBoard = this.cloneGameBoard();
        let valid_move = [];

        for (let move of this.possible_moves) {
            if (move[move.length - 1][0] === x && move[move.length - 1][1] === y) {
                valid_move = move;
            }
        }

        let move_result = State.ERROR;
        for (let i = 0; i <= valid_move.length - 2; ++i) {

            move_result = this.movePiece(valid_move[i][0], valid_move[i][1], valid_move[i + 1][0], valid_move[i + 1][1]);

            this.gameMoves.push({
                "old_pos": valid_move[i],
                "new_pos": valid_move[i + 1],
                "player": this.playerTurn,
                "board": this.cloneGameBoard()
            });

        }

        if (move_result === State.ERROR) {
            this.errorOccurred();
            return State.ERROR;
        }
        this.previousBoard = auxBoard;
        this.changeTurn();

        //falta aqui quando é jogada complicada

        this.possible_moves = [];
        this.movesBoard = [...Array(8)].map(e => Array(8).fill([]));
    }


    movePiece(selectedX, selectedY, x, y) {

        const dx = (selectedX - x);
        const dy = (selectedY - y);
        let ate = 0;
        let isEatingKing = false;
        if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {

            const [middleX, middleY, _, __] = this.getMiddlePiece(selectedX, selectedY, x, y);

            if (this.checkBounds(middleX, middleY)
                && this.isPieceKing(middleX, middleY, this.playerTurn === 1 ? 2 : 1))
                isEatingKing = true;


            ate = this.eatPiece(selectedX, selectedY, dx, dy, this.gameBoard);
            if (ate === State.ERROR || ate === 0) {// no capture was made from a [2,2] move
                this.errorOccurred();
                return State.ERROR;
            }
        }

        this.moveSelectedPiece(selectedX, selectedY, x, y, this.gameBoard);

        if (ate !== 0) {
            // Just eats 1 for now
            this.capturedPieces.push(
                {
                    "initial_pos": [selectedX + (x - selectedX - 1),
                        selectedY + (y - selectedY - 1), 1],
                    "current_offset": 0,
                    "color": (this.playerTurn === 1 ? "white" : "black"),
                    "ateKing": isEatingKing
                }
            )

        }


        this.animations.push({
            "initial_pos": [selectedX, selectedY],
            "final_pos": [x, y],
            "current_offset": 1,
            "ateKing": isEatingKing
        });


        return {"gameBoard": this.gameBoard, "ate": ate};
    }

    getMiddlePiece(selectedX, selectedY, dx, dy) {
        const x_dir = dx > 0 ? -1 : 1;
        const y_dir = dy > 0 ? -1 : 1;
        const middle_x = selectedX + x_dir;
        const middle_y = selectedY + y_dir;
        return [middle_x, middle_y, x_dir, y_dir];
    }


    eatPiece(selectedX, selectedY, dx, dy, gameBoard) {
        const [middle_x, middle_y, x_dir, y_dir] = this.getMiddlePiece(selectedX, selectedY, dx, dy);

        if (!this.checkBounds(middle_x, middle_y)) return 0;
        if (!this.checkBounds(middle_x + x_dir, middle_y + y_dir)) return 0;

        if (gameBoard[middle_x][middle_y] !== 0 && gameBoard[middle_x + x_dir][middle_y + y_dir] === 0) {
            gameBoard[middle_x][middle_y] = 0;
            return 1;
        }

        return 0;
    }

    errorOccurred() {
        if (this.currentState === State.ERROR) return;
        this.stashedState = this.currentState;
        this.currentState = State.ERROR;
    }

    isPieceKing(x, y, player = this.playerTurn, gameBoard = this.gameBoard) {
        if (!this.checkBounds(x, y)) return false;
        return gameBoard[x][y] === player + 2;
    }


    moveSelectedPiece(selected_x, selected_y, x, y, gameBoard) {
        this.fillSquare(x, y, gameBoard, this.isPieceKing(selected_x, selected_y));
        gameBoard[selected_x][selected_y] = 0;
        this.selected = [-1, -1];
    }


    fillSquare(x, y, gameBoard, isPieceKing = false) {
        if ((this.playerTurn === 1 && x === 7) || (this.playerTurn === 2 && x === 0)) {
            gameBoard[x][y] = this.playerTurn + 2; // turn to king
        } else {
            gameBoard[x][y] = this.playerTurn +  2 * isPieceKing;
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

    isPieceSelected(piecePos) {
        return this.selected[0] === piecePos[0] && this.selected[1] === piecePos[1];
    }

    anyPieceSelected() {
        return this.selected !== null
            && this.selected[0] !== -1 && this.selected[1] !== -1;
    }


}