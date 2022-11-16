import {CGFinterface, CGFapplication, dat} from '../lib/CGF.js';

/**
 * MyInterface class, creating a GUI interface.
 */

export class MyInterface extends CGFinterface {

    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        this.initKeys();

        return true;
    }

    updateInterface() {
        this.commandGUI();
        this.lightGUI();
        this.viewGUI();
        this.highlightGUI();
    }


    commandGUI() {
        let commandFolder = this.gui.addFolder("CommandControl");
        commandFolder.add(this.scene, 'displayAxis').name("Display Axis");
        commandFolder.add(this.scene, 'visibleLights').name("Display Lights");
        commandFolder.add(this.scene, 'activeNormals').name("Display Normals")
        commandFolder.open();
    }

    viewGUI() {
        let viewFolder = this.gui.addFolder("ViewControl");

        this.scene.camera = this.scene.graph.views[this.scene.graph.defaultView];
        this.setActiveCamera(this.scene.camera);

        let views = this.scene.views;
        let viewNames = [];
        for (let key in views) viewNames.push(key);
        viewFolder.add(this.scene, 'init_camera', viewNames).name("Views").onChange(function (value) {
            this.scene.camera = this.scene.views[value];
            this.setActiveCamera(this.scene.camera);
        }.bind(this));

        viewFolder.open();
    }

    lightGUI() {
        let lightFolder = this.gui.addFolder("LightControl");
        for (const light of this.scene.lights) {
            if (this.scene.graph.lights[light.name] === undefined) continue;
            if (light.enabled) lightFolder.add(light, 'enabled').name(light.name);
            else lightFolder.add(light, 'enabled').name(light.name).listen();
        }
        lightFolder.open();
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = function () {
        };
        this.activeKeys = {};
    }

    processKeyDown(event) {
        if (event.code === "KeyM" || event.code === "Keym")
            this.scene.incrementCounter();

        this.activeKeys[event.code] = true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        if (this.activeKeys[keyCode] === true && (keyCode === "keym" || keyCode === "keyM")) {
            this.activeKeys[keyCode] = false;
            return true;
        }
        return this.activeKeys[keyCode] || false;
    }

    highlightGUI() {
        let highlightFolder = this.gui.addFolder("HighlightControl");
        highlightFolder.open();


        // TODO: what are these supposed to do?
        // highlightFolder.add(this.scene, 'highLightScaleFactor', 0.1, 3).name("Scale Factor");
        highlightFolder.addColor(this.scene, 'highLightColor').name("Color").onChange(function (value) {
            this.scene.highLightColor = value;
        }.bind(this));

        highlightFolder.add(this.scene, 'highLightAmplitude', 0.1, 1).name("Amplitude");
        highlightFolder.add(this.scene, 'highLightFrequency', 0.1, 3).name("Frequency");
        highlightFolder.add(this.scene, 'highLightPhase', 0, 2 * Math.PI).name("Phase");

        let highlightedObjectsFolder = highlightFolder.addFolder("Highlightable Objects");

        // TODO: why javascript?
        let highlightableObjects = this.scene.components;
        highlightableObjects = Array.from(highlightableObjects.values()).filter((component) => component.isHighlighted);

        for (const component of highlightableObjects) {
            if(!component) continue;
            if (component.hightlight) highlightFolder.add(component, 'highlight').name(component.id);
            else highlightedObjectsFolder.add(component, 'highlight').name(component.id).listen();
        }
    }
}