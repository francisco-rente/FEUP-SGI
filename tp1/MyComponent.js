import {CGFobject} from "../lib/CGF.js";

export class MyComponent extends CGFobject {

    constructor(scene, id) {
        super(scene);
        this._scene = scene;
        this._id = id;

        this._primitives = [];
        this._children = [];

        this._texture = null;
        this._texture_coord = (1 , 1);
    }


    display() {
        //DOUBT: is this.texture.bind() necessary?
        // this.scene.pushMatrix();


        // Doesn't work, the stack is always incrementing, maybe save the parent id.
        // Pass the texture to the child with none type, so that it knows what to restore?
        // Or does pop guarantee the shift is well done?? No because the next one overrides the position n - 1
        // Can a bind() call here be all we need? Do we need to play with scene?


        if (this.isTexture(this._texture,"none")) this._scene.removeParentTexture();
        else this._scene.pushTexture(this._texture);// overrides or applies its own


        this._scene.applyTexture();
        //  this.texture.bind();

        for (const primitive of this._primitives) primitive.display();

        for (let child of this._children) {
            if (this.isTexture(child.texture,"inherit")){
                // passes the parent texture and coordinates
                child.texture = this._texture; // DOUBT: what if texture is inherit or there is no texture here?
                child.updateTexCoords(this._texture_coord);
            }

            child.display();
        }

        if (this.isTexture(this._texture,"none")) this._scene.restoreParentTexture();
        else this._scene.popTexture(this._texture);

        // this.scene.popMatrix();
    }


    isTexture(texture, type){
        if (typeof texture === "string") return type === texture;
        else if (typeof texture === "object" ) return type === "texture";
        return null;
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

}