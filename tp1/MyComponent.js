import {CGFobject} from "../lib/CGF.js";

export class MyComponent extends CGFobject {
    constructor(scene, id) {
        super(scene);
        this.scene = scene;
        this.id = id;
        this.texture = null;
        this.children = [];
    }


    setTexture(texture) {
        this.texture = texture;
    }

    addChild(child) {
        this.children.push(child);
    }

    getTexture() {
        return this.texture;
    }

    getID() {
        return this.id;
    }

    display() {
        //DOUBT: is this.texture.bind() necessary?
        // this.scene.pushMatrix();
        this.scene.pushTexture();
        if (this.texture != null) this.scene.setTexture(this.texture);
        console.log(this.children)
        for (let child of this.children) {
            console.log(this.id + " displaying child");
            child.display();
        }
        this.scene.popTexture();
        // this.scene.popMatrix();
    }

}