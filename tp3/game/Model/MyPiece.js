export class MyPiece {

    constructor(player) {
        this.player = player;
        this.isCaptured = false;
        this.isKing = false;
        this.position = [-1, -1];
    }


    clone() {
        const piece = new MyPiece(this.player);
        piece.isCaptured = this.isCaptured;
        piece.isKing = this.isKing;
        piece.position = this.position;
        return piece;
    }

}