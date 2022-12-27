export class MyPlayer {
    constructor(name) {
        this.name = name;
        this.pieces = [];
        this.capturedPieces = [];
        this.score = 0;
        this.time = new Date();
    }
}