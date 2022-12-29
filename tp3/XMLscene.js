import {CGFappearance, CGFscene, CGFshader, CGFcamera, CGFaxis} from '../lib/CGF.js';
import {Board} from "./game/Model/Board.js";
import {MyCylinder} from "./primitives/MyCylinder.js";
import {MyRectangle} from "./primitives/MyRectangle.js";
import { MyPieceView} from './game/View/MyPieceView.js';

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

        this.highLightPhase = 1;
        this.highLightAmplitude = 1;
        this.highLightFrequency = 1;
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

        this.setPickEnabled(true);

        this.displayAxis = false;
        this.axis = new CGFaxis(this);

        this.visibleLights = true;
        this.activeNormals = false;

        this.highlightShader = new CGFshader(this.gl, "shaders/highlight.vert", "shaders/highlight.frag");
        
        this.highlightShader.setUniformsValues({uSampler: 0});

        this.fontShader = new CGFshader(this.gl, "shaders/font.vert", "shaders/font.frag");
        this.fontShader.setUniformsValues({'dims': [16, 16]});

        this.setUpdatePeriod(20);
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
                if (light[1] === "omni") {
                    this.parseOmniLight(this.lights[i], light[2], light[3], light[4], light[5], light[6]);
                }
                if (light[1] === "spot") {
                    this.parseSpotLight(this.lights[i], light[2], light[3], light[4], light[5], light[6], light[7], light[8], light[9]);
                }

                this.lights[i].setVisible(true);
                if (light[0]) this.lights[i].enable(); // TODO: check this, without === all are enabled
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

    cloneMaterial(material) {
        const newMaterial = new CGFappearance(this);
        newMaterial.setAmbient(material.ambient[0], material.ambient[1], material.ambient[2], material.ambient[3]);
        newMaterial.setDiffuse(material.diffuse[0], material.diffuse[1], material.diffuse[2], material.diffuse[3]);
        newMaterial.setSpecular(material.specular[0], material.specular[1], material.specular[2], material.specular[3]);
        newMaterial.setShininess(material.shininess);
        // newMaterial.id = material.id;
        // newMaterial.texture = new CGFtexture(this, material.texture.image.src)

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


    setHighlightShader(color, scaleFactor) {
        this.highlightShader.setUniformsValues({color: color, scaleFactor: scaleFactor});
        this.setActiveShader(this.highlightShader);
    }

    setFontShader(coords) {
        this.fontShader.setUniformsValues({'charCoords': coords}); 
        this.setActiveShader(this.fontShader);
    }

    setFontShaderNumber(number) {
        this.fontShader.setUniformsValues({'charCoords': [number, 3]}); 
        this.setActiveShader(this.fontShader);
    }

    resetShader() {
        this.setActiveShader(this.defaultShader);
    }


    /** Handler called when the graph is finally loaded.
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        // map of ids to components in the graph.components
        this.components = new Map();
        this.graph.components.forEach(component => {
            this.components.set(component.id, component);
        });

        this.currentCamera = 0;
        this.initLights();
        this.updateViews();
        this.interface.updateInterface()
        this.sceneInited = true;
        this.startTime = null;
    }


    managePicking()
    {
        if (this.pickMode === false) {
            // results can only be retrieved when picking mode is false
            if (this.pickResults != null && this.pickResults.length > 0) {
                for (let i = 0; i< this.pickResults.length; i++) {

                    const  obj = this.pickResults[i][0];
                    if (obj)
                    {   
                        const customId = this.pickResults[i][1];
                        // TODO: this can be abstracted to a function in a "game controller" class

                        if(obj instanceof MyPieceView) {
                            const i = Math.floor(customId / 10) - 1;
                            const j = customId % 10 - 1;
                            this.graph.board.gameLogic.selectPiece(i, j);
                        }
                        else if(obj instanceof MyRectangle) {
                            if(customId === 100) {
                                this.graph.board.gameLogic.undo();

                            }
                            else if(customId === 101) {
                                /*
                                let cameras = [
                                new CGFcamera(0.8, 0.1, 500, vec3.fromValues(-5, 30, 15), vec3.fromValues(18, 0, 15)),
                                new CGFcamera(0.8, 0.1, 500, vec3.fromValues(45, 30, 15), vec3.fromValues(18, 0, 15)),
                                new CGFcamera(0.8, 0.1, 500, vec3.fromValues(20, 30, 15), vec3.fromValues(18, 0, 15)),
                                ]
                                */

                                let cameras = [
                                    [-5, 30, 15],
                                    [45, 30, 15],
                                    [20, 30, 15]
                                ]
                                let prevCamera = this.currentCamera;
                                this.currentCamera == 2 ? this.currentCamera = 0 : this.currentCamera++;
                                this.graph.board.boardView.updateCamera(cameras[prevCamera], cameras[this.currentCamera]);
                            }
                            else if(customId === 102) {
                                this.graph.board.gameLogic.gameMovie();
                            }
                            else{
                                const i = Math.floor(customId / 10) - 1;
                                const j = customId % 10 - 1;
                                this.graph.board.gameLogic.movePieceFromInput(i, j); // TODO: if error is thrown, should we make something here
                            }
                        }
                    }
                }
                this.pickResults.splice(0,this.pickResults.length);
            }
        }
    }



    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        this.managePicking();
        this.clearPickRegistration();
        
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);


        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        if (this.displayAxis) this.axis.display();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(this.visibleLights);
            this.lights[i].update();
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.board.display();
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    incrementCounter() {
        this.appearence_index = (Number.MAX_SAFE_INTEGER === this.appearence_index)
            ? 0 : this.appearence_index + 1;
    }

    checkKeys() {
        if (this.gui.isKeyPressed("KeyM")) {
            console.log("Key M pressed");
            // prevent overflow of the index
        }
    }


    // called periodically (as per setUpdatePeriod() in init())
    update(t) {

        if (this.startTime === null) this.startTime = t;

        if (this.graph.animations !== null && this.graph.animations !== undefined)
            for (let key in this.graph.animations)
                this.graph.animations[key].update((t - this.startTime) / 1000);

        //const timeFactor = (Math.sin(t) + 1) / 2;
        //const timeFactor = (Math.sin(Math.floor(t%1000/100)) + 1) / 2;
        const timeFactor = (Math.sin(((t / 1000 % 1000))) + 1) / 2;
        this.highlightShader.setUniformsValues({timeFactor: timeFactor});
    }

    updateViews() {
        this.views = this.graph.views;
        this.camera = this.graph.views[this.graph.defaultView];
        this.init_camera = this.graph.defaultView;
        this.interface.setActiveCamera(this.camera);
    }
}