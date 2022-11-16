import {MyAnimation} from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {

    // TODO: best way to time manage this?
    // a counter inside the class
    // get the current time from the scene


    // SEE SLIDES FOR START TIME LOGIC

    static checkKeyFramesOrder(keyframes) {
        return Object.keys(keyframes).reduce((acc, curr) => {
            if (acc === false) return false;
            if (curr < acc) return false;
            return curr;
        });
    }

    constructor(scene, id, keyframes) {
        super();
        this._scene = scene;
        this._id = id;
        this.keyframes = keyframes; // {instant -> matrix}
    }

    update(time) {

    }

    apply() {

    }

}