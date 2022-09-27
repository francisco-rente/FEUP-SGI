import {CGFobject} from "../lib/CGF";

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

    display() {
        //DOUBT: is this.texture.bind() necessary?
        // this.scene.pushMatrix();
        if (this.texture != null) this.texture.apply();
        for (let child of this.children) child.display();
        // this.scene.popMatrix();
    }

}