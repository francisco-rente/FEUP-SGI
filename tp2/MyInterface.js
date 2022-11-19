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

        // highlightFolder.add(this.scene, 'highLightAmplitude', 0.1, 1).name("Amplitude");
        // highlightFolder.add(this.scene, 'highLightFrequency', 0.1, 3).name("Frequency");
        // highlightFolder.add(this.scene, 'highLightPhase', 0, 2 * Math.PI).name("Phase");

        let highlightableObjects = this.scene.components;
        highlightableObjects = Array.from(highlightableObjects.values()).filter((component) => component.hasHighlight);

        for (const component of highlightableObjects) {
            const componentHighLightFolder = highlightFolder.addFolder(component.id);
            if (component.hightlight) componentHighLightFolder.add(component, 'highlight').name(component.id);
            else componentHighLightFolder.add(component, 'highlight').name(component.id).listen();

            componentHighLightFolder.addColor(component, 'highlightColor').name("Color").onChange(function (value) {
                // TODO: is the opacity necessary or even allowed in shader
                component.highlightColor = value;
            }.bind(component));

            component.highlightColor = component.highlightColor.map((value) => value * 255);

            componentHighLightFolder.add(component, 'highlightScale', 0.1, 4).name("Scale Factor").onChange(function (value) {
                component.highlightScale = value;
            }.bind(component));

        }
    }
}