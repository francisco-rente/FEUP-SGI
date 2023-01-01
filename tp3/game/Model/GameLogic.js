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
    }

    
    endGame() {
        //TODO: Test this

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
        //this.player1 = player1;
        this.player1.time = new Date();
        //this.player2 = player2;
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

        if (!(this.checkPiece(x, y))) {
            this.errorOccurred();
            return State.ERROR;
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
        console.log("movesBoard is ")
        console.log(this.movesBoard)
        if(this.movesBoard.length === 0) {
            this.movesBoard = this.getMovesBoard();
        }
        console.log("getPossibleMovesFromSelection is about to return" + this.movesBoard[selectedX][selectedY])
        return this.movesBoard[selectedX][selectedY];


/*
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
        */
    }

    getMovesBoard() {
        console.loh("getMovesBoard is called")
        let canCapture = false;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.movesBoard[i][j] = [];
                if(!canCapture){
                    console.log("result of checkdiagonals is " + this.checkDiagonals(i, j, this.gameBoard));

                    this.movesBoard[i][j].push(this.checkDiagonals(i, j, this.gameBoard));
                }

                let captureMoves = this.checkCaptureMoves(i, j, this.cloneGameBoard());

                console.log("captureMoves is " + captureMoves);
                if(captureMoves.length !== 0 && !canCapture) {
                    canCapture = true;
                    this.movesBoard[i][j] = [];
                    
                }

                this.movesBoard[i][j].push(captureMoves);

            }
        }
    }

    checkCaptureMoves(selectedX, selectedY, cloneBoard, rec_depth = 0) {
        if(rec_depth > 3) {
            return [];
        }
        let captureMoves = [];

            const direction = this.playerTurn === 1 ? 1 : -1;
            for (let i = -1; i <= 1; i += 2) {

                if (this.checkBounds(selectedX + direction, selectedY + i)
                    && this.checkBounds(selectedX + 2 * direction, selectedY + 2 * i)
                    && cloneBoard[selectedX + direction][selectedY + i] !== 0
                    && cloneBoard[selectedX + direction][selectedY + i] !== this.playerTurn
                    && cloneBoard[selectedX + 2 * direction][selectedY + 2 * i] === 0) {


                        //aqui por algo caso a rec depth seja maior que zero
                    if(rec_depth > 0) {
                        captureMoves.push([selectedX, selectedY, selectedX + 2 * direction, selectedY + 2 * i]);
                    }else{
                        captureMoves.push([selectedX + 2 * direction, selectedY + 2 * i]);
                    }

                    
                    if(selectedY + 2 * i === 0 || selectedY + 2 * i === 7) {
                        cloneBoard[selectedX + 2 * direction][selectedY + 2 * i] = this.playerTurn + 2;
                    }
                    else {
                        cloneBoard[selectedX + 2 * direction][selectedY + 2 * i] = this.playerTurn;
                    }
                    cloneBoard[selectedX + direction][selectedY + i] = 0;
                    cloneBoard[selectedX][selectedY] = 0;
                    captureMoves = captureMoves.concat(this.checkCaptureMoves(selectedX + 2 * direction, selectedY + 2 * i, this.cloneBoard(cloneBoard), rec_depth + 1));
                }
            }
            if(this.isPieceKing(selectedX, selectedY)) {
                //TODO: não repetir isto
                direction === 1 ? direction = -1 : direction = 1;
                for (let i = -1; i <= 1; i += 2) {

                    if (this.checkBounds(selectedX + direction, selectedY + i)
                        && this.checkBounds(selectedX + 2 * direction, selectedY + 2 * i)
                        && cloneBoard[selectedX + direction][selectedY + i] !== 0
                        && cloneBoard[selectedX + direction][selectedY + i] !== this.playerTurn
                        && cloneBoard[selectedX + 2 * direction][selectedY + 2 * i] === 0) {
    
    
                            //aqui por algo caso a rec depth seja maior que zero
                        if(rec_depth > 0) {
                            captureMoves.push([selectedX, selectedY, selectedX + 2 * direction, selectedY + 2 * i]);
                        }else{
                            captureMoves.push([selectedX + 2 * direction, selectedY + 2 * i]);
                        }
    
                        
                        if(selectedY + 2 * i === 0 || selectedY + 2 * i === 7) {
                            cloneBoard[selectedX + 2 * direction][selectedY + 2 * i] = this.playerTurn + 2;
                        }
                        else {
                            cloneBoard[selectedX + 2 * direction][selectedY + 2 * i] = this.playerTurn;
                        }
                        cloneBoard[selectedX + direction][selectedY + i] = 0;
                        cloneBoard[selectedX][selectedY] = 0;
                        captureMoves = captureMoves.concat(this.checkCaptureMoves(selectedX + 2 * direction, selectedY + 2 * i, this.cloneBoard(cloneBoard), rec_depth + 1));
                    }
            }
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
        if (this.selected[0] === -1 && this.selected[1] === -1){
            console.log("inside return")
            return
        }
        const [selectedX, selectedY] = this.selected;
        this.possible_moves = this.movesBoard[selectedX][selectedY];
        
        let auxBoard = this.cloneGameBoard();


        for(let move of this.possible_moves){
            console.log(move);
        }
        //const move_result = this.movePiece(selectedX, selectedY, x, y);
        
        
        if (move_result === State.ERROR) {
            this.errorOccurred();
            return State.ERROR;
        }
        this.previousBoard = auxBoard;
        this.changeTurn();
        
        //falta aqui quando é jogada complicada
        this.gameMoves.push({
            "old_pos": [selectedX, selectedY],
            "new_pos": [x, y],
            "player": this.playerTurn,
            "score_increased": move_result["ate"], // TODO: for now, only one piece can be eaten
            "board": this.cloneGameBoard()
        });
        this.possible_moves = [];
        this.movesBoard = [];
    }



    movePiece(selectedX, selectedY, x, y) {
        /*JULGO QUE ISTO N DEVERIA SER AQUI

        if (!this.checkMovePieceConditions(selectedX, selectedY, x, y)) {
            console.log("invalid move");
            this.errorOccurred();
            return State.ERROR;
        }

        const dx = (selectedX - x);
        const dy = (selectedY - y);
        if (dx * dy === 0) {
            this.errorOccurred();
            return State.ERROR;
        }
*/
        const dx = (selectedX - x);
        const dy = (selectedY - y);
        let ate = 0;
        let isEatingKing = false;
        if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {

            const [middleX, middleY, _, __] = this.getMiddlePiece(selectedX, selectedY, x, y);
            isEatingKing = this.isPieceKing(middleX, middleY, this.playerTurn === 1 ? 2 : 1);

            ate = this.eatPiece(selectedX, selectedY, dx, dy, this.gameBoard);
            if (ate === State.ERROR || ate === 0) {// no capture was made from a [2,2] move
                this.errorOccurred();
                return State.ERROR;
            }
            this.incrementScore(this.playerTurn, ate);
        }

        if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2)
            this.moveSelectedPiece(selectedX, selectedY, x, y, this.gameBoard);
        else{
            this.errorOccurred();
            return State.ERROR;
        }



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


    incrementScore(player, score) {
        if (player === 1) this.player1.score += score; else this.player2.score += score;
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


        //Julgo n ser preciso
        /*
        if (!this.checkBounds(middle_x, middle_y) &&
            !this.checkBounds(middle_x + x_dir, middle_y + y_dir)) {
            this.errorOccurred();
            return State.ERROR;
        }*/

        if (gameBoard[middle_x][middle_y] !== 0 && gameBoard[middle_x + x_dir][middle_y + y_dir] === 0) {
            // Will eat piece
            gameBoard[middle_x][middle_y] = 0;
            return 1;
        }

        return 0;
    }

    errorOccurred() {
        if(this.currentState === State.ERROR) return;
        this.stashedState = this.currentState;
        this.currentState = State.ERROR;
    }

    isPieceKing(x, y, player = this.playerTurn) {
        return this.gameBoard[x][y] === player + 2;
    }

    checkMovePieceConditions(selectedX, selectedY, x, y) {
        if (selectedX === -1 || selectedY === -1) return false;
        if (this.currentState !== State.SELECT_SQUARE) return false;
        if (!this.checkBounds(x, y) || this.gameBoard[x][y] !== 0) return false;
        const isKing = this.isPieceKing(selectedX, selectedY);
        return !(!isKing && (x - selectedX) * (this.playerTurn === 1 ? 1 : -1) <= 0);
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

    isPieceSelected(piecePos) {
        return this.selected[0] === piecePos[0] && this.selected[1] === piecePos[1];
    }

    anyPieceSelected() {
        return this.selected !== null
            && this.selected[0] !== -1 && this.selected[1] !== -1;
    }


}