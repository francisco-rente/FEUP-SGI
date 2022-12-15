import {MyAnimation} from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {


    static checkKeyFramesOrder(keyframes) {
        return keyframes.map(
            (keyframe) => keyframe.instant
        ).reduce((acc, curr) => {
            if (acc === false) return false;
            if (parseFloat(curr) < parseFloat(acc)) return false;
            return curr;
        });
    }

    constructor(scene, id, keyframes) {
        super();
        this._scene = scene;
        this._id = id;
        this.currentMatrix = mat4.create();
        this.keyframes = keyframes;
        this.currentKeyframeIndex = 0;
        this.nextKeyframeIndex = 1;
        this.isVisible = false;

        if (keyframes.length === 0) throw new Error("Keyframes array is empty");
        if (keyframes.length === 1) {
            this.currentMatrix = mat4.create();
            this.translateMatrix(keyframes[0].translation, keyframes[0].translation, 0);
            this.rotateMatrix(keyframes[0].rotation, keyframes[0].rotation, 0);
            this.scaleMatrix(keyframes[0].scale, keyframes[0].scale, 0);
        }
        console.log(this.keyframes);
    }

    update(time) {
        if (time <= this.keyframes[0].instant) return; // animation not started yet
        this.isVisible = true;
        if (this.keyframes.length === 1) return; // animation has only one keyframe, has been calculated in constructor

        // next keyframe is the last one, and we've exceeded its instant (finished animation)
        if (this.nextKeyframeIndex === this.keyframes.length - 1
            && time >= this.keyframes[this.keyframes.length - 1].instant) {
            //TODO: is the current matrix the last keyframe matrix?

            this.currentMatrix = mat4.create();
            this.translateMatrix(this.keyframes[this.keyframes.length - 1].translation, this.keyframes[this.keyframes.length - 1].translation, 0);
            this.rotateMatrix(this.keyframes[this.keyframes.length - 1].rotation, this.keyframes[this.keyframes.length - 1].rotation, 0);
            this.scaleMatrix(this.keyframes[this.keyframes.length - 1].scale, this.keyframes[this.keyframes.length - 1].scale, 0);

            return;
        }

        // find the current and next keyframes, by comparing the time with the keyframes instants
        this.keyframes.find((keyframe, index) => {
            if (time <= keyframe.instant) {
                this.nextKeyframeIndex = index;
                this.currentKeyframeIndex = index - 1;
                return true;
            }
        });


        const currentKeyframe = this.keyframes[this.currentKeyframeIndex];
        const nextKeyframe = this.keyframes[this.nextKeyframeIndex];


        // (t – Timeinitial) / Timetotal -> change ratio from current keyframe to next keyframe
        const change_ratio = (time - currentKeyframe.instant) /
            (nextKeyframe.instant - currentKeyframe.instant);

        this.currentMatrix = mat4.create(); // reset current matrix
        // calculate current matrix
        this.translateMatrix(currentKeyframe.translation, nextKeyframe.translation, change_ratio);
        this.rotateMatrix(currentKeyframe.rotation, nextKeyframe.rotation, change_ratio);
        this.scaleMatrix(currentKeyframe.scale, nextKeyframe.scale, change_ratio);
    }


    translateMatrix(currentTranslation, nextTranslation, change_ratio) {
        let translation = vec3.create();
        translation = vec3.lerp(translation, currentTranslation, nextTranslation, change_ratio);
        mat4.translate(this.currentMatrix, this.currentMatrix, translation);
    }


    rotateMatrix(currentRotation, nextRotation, change_ratio) {
        let rotation = vec3.create();
        rotation = vec3.lerp(rotation, currentRotation, nextRotation, change_ratio);
        mat4.rotate(this.currentMatrix, this.currentMatrix, rotation[0], [1, 0, 0]);
        mat4.rotate(this.currentMatrix, this.currentMatrix, rotation[1], [0, 1, 0]);
        mat4.rotate(this.currentMatrix, this.currentMatrix, rotation[2], [0, 0, 1]);
    }


    scaleMatrix(currentScale, nextScale, change_ratio) {
        let scale = vec3.create();
        scale = vec3.lerp(scale, currentScale, nextScale, change_ratio);
        mat4.scale(this.currentMatrix, this.currentMatrix, scale);
    }


    apply() {
        if (!this.isVisible) return; // animation not started yet
        // apply current matrix to scene graph
        if (this.currentMatrix !== null) this._scene.multMatrix(this.currentMatrix);
    }

}