import {CGFappearance, CGFscene, CGFtexture} from '../lib/CGF.js';
import {CGFaxis, CGFcamera} from '../lib/CGF.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     */
    constructor(myinterface) {
        super();
        this.appearence_stack = [];
        this.texture_stack = [];
        this.appearence_index = 0;
        this.interface = myinterface;
        this.lights = [];
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);


        this.displayAxis = false;
        this.axis = new CGFaxis(this);

        this.visibleLights = true;
        this.activeNormals = false;

        this.setUpdatePeriod(100);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    parseOmniLight(light, position, ambient, diffuse, specular, attenuation) {
        light.setPosition(position[0], position[1], position[2], position[3]);
        light.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
        light.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
        light.setSpecular(specular[0], specular[1], specular[2], specular[3]);
        light.setConstantAttenuation(attenuation[0]);
        light.setLinearAttenuation(attenuation[1]);
        light.setQuadraticAttenuation(attenuation[2]);
    }


    parseSpotLight(light, position, target, ambient, diffuse, specular, attenuation, angle, exponent) {
        light.setPosition(position[0], position[1], position[2], position[3]);
        light.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
        light.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
        light.setSpecular(specular[0], specular[1], specular[2], specular[3]);
        light.setConstantAttenuation(attenuation[0]);
        light.setLinearAttenuation(attenuation[1]);
        light.setQuadraticAttenuation(attenuation[2]);
        light.setSpotCutOff(angle);
        light.setSpotExponent(exponent);
        light.setSpotDirection(target[0] - position[0], target[1] - position[1], target[2] - position[2]);

        let dir = vec3.fromValues(target[0] - position[0], target[1] - position[1], target[2] - position[2]);
        vec3.normalize(dir, dir);
        light.setSpotDirection(dir[0], dir[1], dir[2]);
    }


    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        let i = 0;

        // Reads the lights from the scene graph.
        for (let key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                const light = this.graph.lights[key];
                this.lights[i].name = key; // for interface dropdown
                if(light[1] === "omni"){
                    this.parseOmniLight(this.lights[i], light[2], light[3], light[4], light[5], light[6]);
                    /*this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                    this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                    this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                    this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
                    this.lights[i].setConstantAttenuation(light[6][0]);
                    this.lights[i].setLinearAttenuation(light[6][1]);
                    this.lights[i].setQuadraticAttenuation(light[6][2]);    */
                }
                if (light[1] === "spot") {
                    this.parseSpotLight(this.lights[i], light[2], light[3], light[4], light[5], light[6], light[7], light[8], light[9]);
                    /*this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                    this.lights[i].setAmbient(light[4][0], light[4][1], light[4][2], light[4][3]);
                    this.lights[i].setDiffuse(light[5][0], light[5][1], light[5][2], light[5][3]);
                    this.lights[i].setSpecular(light[6][0], light[6][1], light[6][2], light[6][3]);
                    this.lights[i].setConstantAttenuation(light[7][0]);
                    this.lights[i].setLinearAttenuation(light[7][1]);
                    this.lights[i].setQuadraticAttenuation(light[7][2]);    
                    this.lights[i].setSpotCutOff(light[8]);
                    this.lights[i].setSpotExponent(light[9]);
                    this.lights[i].setSpotDirection(light[3][0]- light[2][0], light[3][1]-light[2][1], light[3][2]-light[2][2]);*/
                }

                this.lights[i].setVisible(true);
                if (light[0] === 1) this.lights[i].enable(); // TODO: check this, without === all are enabled
                else this.lights[i].disable();

                this.lights[i].update();
                i++;
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }


    createDefaultAppearance() {
        const defaultAppearance = new CGFappearance(this);
        defaultAppearance.setAmbient(0.2, 0.4, 0.8, 1.0);
        defaultAppearance.setDiffuse(0.2, 0.4, 0.8, 1.0);
        defaultAppearance.setSpecular(0.2, 0.4, 0.8, 1.0);
        defaultAppearance.setShininess(10.0);
        return defaultAppearance;
    }

    pushDefaultAppearance() {
        this.pushAppearance(this.createDefaultAppearance());
    }

    cloneMaterial(material, texture) {
        const newMaterial = new CGFappearance(this);
        newMaterial.setAmbient(material.ambient[0], material.ambient[1], material.ambient[2], material.ambient[3]);
        newMaterial.setDiffuse(material.diffuse[0], material.diffuse[1], material.diffuse[2], material.diffuse[3]);
        newMaterial.setSpecular(material.specular[0], material.specular[1], material.specular[2], material.specular[3]);
        newMaterial.setShininess(material.shininess);
        
        //newMaterial.texture = new CGFtexture(this, material.texture.image.src)

        newMaterial.texture = material.texture;
        return newMaterial;
    }

    getAppearanceStackTop() {
        // TODO: Clone may take a toll on memory
        return this.cloneMaterial(this.appearence_stack[this.appearence_stack.length - 1]);
    }

    pushAppearance(appearance) {
        this.appearence_stack.push(appearance);
    }

    popAppearance() {
        if (this.appearence_stack.length === 0) return null;
        const appearance = this.appearence_stack.pop();
        if (this.appearence_stack.length === 0) this.pushDefaultAppearance();
        else this.applyAppearance();
        return appearance;
    }

    applyAppearance() {
        this.appearence_stack[this.appearence_stack.length - 1].apply();
    }


    getTopTexture() {
        return this.texture_stack[this.texture_stack.length - 1];
    }

    popTexture() {
        if (this.texture_stack.length === 0) return null;
        const texture = this.texture_stack.pop();
        if (this.texture_stack.length === 0) this.texture_stack.push(null);
        return texture;
    }

    pushTexture(texture) {
        this.texture_stack.push(texture);
    }


    /** Handler called when the graph is finally loaded.
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);


        this.initLights();
        this.updateViews();
        this.interface.updateInterface()
        this.sceneInited = true;
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        if(this.displayAxis) this.axis.display();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(this.visibleLights);
            this.lights[i].update();
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }


        this.popMatrix();
        // ---- END Background, camera and axis setup
    }


    checkKeys() {
        if (this.gui.isKeyPressed("KeyM")) {
            console.log("Key M pressed");
            // prevent overflow of the index
            this.appearence_index = (Number.MAX_SAFE_INTEGER === this.appearence_index)
                ? 0 : this.appearence_index + 1;
        }
    }

    // called periodically (as per setUpdatePeriod() in init())
    update(t) {
        this.checkKeys();
    }

    updateViews() {
        this.views = this.graph.views;
        this.camera = this.graph.views[this.graph.defaultView];
        this.interface.setActiveCamera(this.camera);
    }
}