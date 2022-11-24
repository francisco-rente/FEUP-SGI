export class MyKeyFrame {

    constructor(instant, translation, rotation, scale) {
        this._instant = instant;
        this._translation = translation;
        this._rotation = rotation;
        this._scale = scale;
    }


    get instant() {
        return this._instant;
    }

    set instant(value) {
        this._instant = value;
    }

    get translation() {
        return this._translation;
    }

    set translation(value) {
        this._translation = value;
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(value) {
        this._rotation = value;
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        this._scale = value;
    }
}