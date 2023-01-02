export class MyPlayer {
    constructor(name) {
        this.name = name;
        this.pieces = [];
        this.capturedPieces = [];
        this.time = new Date();
    }
}