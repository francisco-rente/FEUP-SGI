import { CGFobject } from "../lib/CGF.js";

export class MyComponent extends CGFobject {

    constructor(scene, id) {
        super(scene);
        this._scene = scene;
        this._id = id;

        this._primitives = [];
        this._children = [];

        this._texture = null;
        this._texture_coord = [1, 1];
        this._parent_texture = null;
        this._parent_texture_coord = [1, 1];

        this.transformation = [];
    }


    display() {
        //DOUBT: is this.texture.bind() necessary?
        let previous_matrix = this._scene.getMatrix();
        this._scene.multMatrix(this.transformation);
        this._scene.pushMatrix();
        this.sendTextureToScene();

        for (const primitive of this._primitives) {
            // primitive.updateTexCoords(this._texture_coord);
            primitive.display();
        }
        for (let child of this._children) {
            child.updateTexCoords(this._texture_coord);
            child.display();
        }
        // let invertMatrix =  mat4.create();
        this._scene.setMatrix(previous_matrix);
        //mat4.invert(invertMatrix, this.transformation)
        //this._scene.multMatrix(invertMatrix)
        this._scene.popTexture();
        this._scene.popMatrix();
        // this.scene.popMatrix();
    }


    sendTextureToScene() {
        if (this._texture === "none") {
            this._scene.pushDefaultTexture();
        } else if (this._texture === "inherit") {
            if (this._scene.getTextureStackTop() === "none")
                this._scene.pushDefaultTexture(); // inherit of none -> default
            else {
                this._scene.pushTexture(this._scene.getTextureStackTop());
                this.scene.applyTexture();
            }

            this._texture_coord = this._parent_texture_coord;
        } else {
            this._scene.pushTexture(this._texture);
            this.scene.applyTexture();
        }
    }


    /*    isTexture(texture, type) {
            if (typeof texture === "string") return type === texture;
            else if (typeof texture === "object") return type === "texture";
            return null;
        }*/

    set texture_coord(value) {
        this._texture_coord = value;
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

    setTextureCoordinates(coords) {
        this._texture_coord = coords;
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


    addPrimitive(primitive) {
        this._primitives.push(primitive);
    }

    updateTexCoords(coords) {
        this.texture_coord = coords;
    }

    get parent_texture() {
        return this._parent_texture;
    }

    set parent_texture(value) {
        this._parent_texture = value;
    }

    get parent_texture_coord() {
        return this._parent_texture_coord;
    }

    set parent_texture_coord(value) {
        this._parent_texture_coord = value;
    }

}