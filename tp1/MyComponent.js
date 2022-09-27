import {CGFobject} from "../lib/CGF.js";

export class MyComponent extends CGFobject {
    constructor(scene, id) {
        super(scene);
        this._texture = null;
        this._children = [];
        this._scene = scene;
        this._id = id;
    }


    setTexture(texture) {
        this._texture = texture;
    }

    addChild(child) {
        this._children.push(child);
    }

    getTexture() {
        return this._texture;
    }

    setTexture(texture) {
        this._texture = texture;
    }

    display() {
        //DOUBT: is this.texture.bind() necessary?
        // this.scene.pushMatrix();
        this._scene.pushTexture();
        if (this._texture != null) this._scene.setTexture(this._texture);
        console.log(this._children)
        for (let child of this._children) child.display();
        this._scene.popTexture();
        // this.scene.popMatrix();
    }

    get scene() {
        return this._scene;
    }

    get id() {
        return this._id;
    }

    get texture() {
        return this._texture;
    }

    get children() {
        return this._children;
    }

    set scene(value) {
        this._scene = value;
    }

    set id(value) {
        this._id = value;
    }

    set texture(value) {
        this._texture = value;
    }

    set children(value) {
        this._children = value;
    }

}