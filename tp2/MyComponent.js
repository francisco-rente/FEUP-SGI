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


        this.hasHighlight = false;

        this.highlighted = false;
        this.highlightColor = [1, 0, 0];
        this.highlightScale = 1;

        this.animation = null;
    }


    set isHighlighted(value) {
        this._isHighlighted = value;
    }

    get isHighlighted() {
        return this._isHighlighted;
    }

    display() {
        if (this.animation && !this.animation.isVisible) return;

        if (this.highlighted) this.scene.setHighlightShader(
            this.highlightColor.map((value) => value / 255),
            this.highlightScale);

        this.sendTextureToScene();
        this.sendAppearanceToScene();

        this._scene.multMatrix(this.transformation);
        if (this.animation !== null) this.animation.apply();

        this.updateCoords();

        for (const primitive of this._primitives) {
            primitive.updateTexCoords(this._texture_coord);
            if (this.scene.activeNormals) primitive.enableNormalViz();
            else primitive.disableNormalViz();
            primitive.display();
        }

        if (this.highlighted) this.scene.resetShader();


        for (let child of this._children) {
            this._scene.pushMatrix();
            child.updateTexCoords(this._texture_coord);
            child.display();
            this._scene.popMatrix();
        }

        this._scene.popTexture();
        this._scene.popAppearance();
    }

    updateCoords() {
        if (this._texture === "inherit") this._texture_coord = this._parent_texture_coord;
        else if (this._texture === "none") this._texture_coord = [1, 1];
    }

    sendAppearanceToScene() {
        const texture = this.getTextureToApply();
        let appearance;

        const curr_access = this.scene.appearence_index % this._materials.length;

        if (this._materials.length === 0 ||
            (typeof this._materials[curr_access] === "string" && this._materials[curr_access] !== "inherit"))
            appearance = this._scene.createDefaultAppearance();
        else if (this._materials[curr_access] === "inherit") {
            appearance = this._scene.getAppearanceStackTop();
        } else appearance = this._materials[curr_access];

        appearance.setTexture(texture);
        appearance.setTextureWrap('REPEAT', 'REPEAT');
        this._scene.pushAppearance(appearance);
        this._scene.applyAppearance();
    }


    getTextureToApply() {
        return this._scene.getTopTexture();
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
        this._parent_texture_coord = coords;
    }

    addMaterial(material) {
        this._materials.push(material);
    }

    get materials() {
        return this._materials;
    }

    sendTextureToScene() {
        switch (this.texture) {
            case "none":
                this._scene.pushTexture(null);
                break;
            case "inherit":
                this._scene.pushTexture(this._scene.getTopTexture());
                break;
            default:
                this._scene.pushTexture(this.texture);
        }
    }


    highlight() {
        (this.highlighted) ? this.highlighted = false : this.highlighted = true;
        return this.highlighted;
    }
}