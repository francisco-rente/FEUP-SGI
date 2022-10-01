import {CGFobject} from "../lib/CGF.js";

export class MyComponent extends CGFobject {

    constructor(scene, id) {
        super(scene);
        this._scene = scene;
        this._id = id;

        this._primitives = [];
        this._children = [];

        this._texture = null;
        this._texture_coord = [1, 1];
        this._parent_texture_coord = [1, 1];

        this._materials = []; // array of materials or inherit string

        this.transformation = [];
    }


    display() {

        this.sendAppearanceToScene();
        // this.sendTextureToScene();
        this._scene.pushMatrix();
        this._scene.multMatrix(this.transformation);


        for (const primitive of this._primitives) {
            // primitive.updateTexCoords(this._texture_coord);
            primitive.display();
        }
        for (let child of this._children) {
            child.updateTexCoords(this._texture_coord);
            child.display();
        }


        // this._scene.popTexture();
        this._scene.popMatrix();
        this._scene.popAppearance();
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


    sendAppearanceToScene() {

        const texture = this.getTextureToApply();
        let appearance;

        if (this._materials.length === 0 ||
            (typeof this._materials[0] === "string" && this._materials[0] !== "inherit"))
            appearance = this._scene.createDefaultAppearance();
        else if (this._materials[0] === "inherit") appearance = this._scene.getAppearanceStackTop();
        else appearance = this._materials[this.scene.appearence_index % this._materials.length];

        appearance.setTexture(texture);
        this._scene.pushAppearance(appearance);
        this._scene.applyAppearance();
    }


    getTextureToApply() {
        switch (this.texture) {
            case "none":
                return null;
            case "inherit":
                return this._scene.getAppearanceStackTop().texture; //TODO: reevaluate cloning of the top
            default:
                return this.texture;
        }
    }


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

    addMaterial(material) {
        this._materials.push(material);
    }

    get materials() {
        return this._materials;
    }

    setMaterials(materials) {
        this._materials = materials;
    }
}