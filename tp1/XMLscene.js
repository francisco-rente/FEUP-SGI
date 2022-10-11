import {CGFappearance, CGFscene} from '../lib/CGF.js';
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
        this.appearence_index = 0;
        this.interface = myinterface;
        this.lights = [];

        this.lightsState = {};
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

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];


                if(light[1] === "omni"){
                    this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                    this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                    this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                    this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
                    this.lights[i].setConstantAttenuation(light[6][0]);
                    this.lights[i].setLinearAttenuation(light[6][1]);
                    this.lights[i].setQuadraticAttenuation(light[6][2]);    
                }
                if (light[1] === "spot") {
                    this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                    this.lights[i].setAmbient(light[4][0], light[4][1], light[4][2], light[4][3]);
                    this.lights[i].setDiffuse(light[5][0], light[5][1], light[5][2], light[5][3]);
                    this.lights[i].setSpecular(light[6][0], light[6][1], light[6][2], light[6][3]);
                    this.lights[i].setConstantAttenuation(light[7][0]);
                    this.lights[i].setLinearAttenuation(light[7][1]);
                    this.lights[i].setQuadraticAttenuation(light[7][2]);    
                    this.lights[i].setSpotCutOff(light[8]);
                    this.lights[i].setSpotExponent(light[9]);
                    // TODO: normalize
                    this.lights[i].setSpotDirection(light[3][0]- light[2][0], light[3][1]-light[2][1], light[3][2]-light[2][2]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();
                // this.lightsState[light[i]] =  true; // light is enabled by default
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

    cloneMaterial(material) {
        const newMaterial = new CGFappearance(this);
        newMaterial.setAmbient(material.ambient[0], material.ambient[1], material.ambient[2], material.ambient[3]);
        newMaterial.setDiffuse(material.diffuse[0], material.diffuse[1], material.diffuse[2], material.diffuse[3]);
        newMaterial.setSpecular(material.specular[0], material.specular[1], material.specular[2], material.specular[3]);
        newMaterial.setShininess(material.shininess);
        // newMaterial.texture = material.texture;
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


    /** Handler called when the graph is finally loaded.
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

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
        this.axis.display();

        for (var i = 0; i < this.lights.length; i++) {
            //this.lights[i].setVisible(true);
            this.lights[i].enable();
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
            ++this.appearence_index;
        }
    }

// called periodically (as per setUpdatePeriod() in init())
    update(t) {
        this.checkKeys();
        // this.updateLights()
    }

    updateLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the lightsAux map.
        for (const light in this.lightsState) {
            if (this.lightsState.hasOwnProperty(light)) {
                if (this.lightsState[light]){
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                }
                else{
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }

                this.lights[i].update();

                i++;
            }
        }
    }


}