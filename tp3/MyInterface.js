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
        this.selectSceneGUI();
        this.lightGUI();
        this.viewGUI();
        this.highlightGUI();
    }


    selectSceneGUI() {
        if(this.selectSceneFolder) return;

        this.selectSceneFolder = this.gui.addFolder("SelectSceneControl");

        const graphs = this.scene.graphs;

        const scenes = Object.keys(graphs);
        this.selectSceneFolder.add(this.scene, 'init_camera', scenes).name("Scene").onChange(function (value) {
            this.scene.changeScene(value);
        }.bind(this));

        this.selectSceneFolder.open();
    }


    commandGUI() {
        if(this.commandFolder) return;

        this.commandFolder = this.gui.addFolder("CommandControl");
        this.commandFolder.add(this.scene, 'displayAxis').name("Display Axis");
        this.commandFolder.add(this.scene, 'visibleLights').name("Display Lights");
        this.commandFolder.add(this.scene, 'activeNormals').name("Display Normals");
        this.commandFolder.close();
    }

    viewGUI() {

        if(this.viewFolder) this.emptyFolder(this.viewFolder);
        else this.viewFolder = this.gui.addFolder("ViewControl");

        this.scene.camera = this.scene.accessGraph().views[this.scene.accessGraph().defaultView];
        this.setActiveCamera(this.scene.camera);

        let views = this.scene.views;
        let viewNames = [];
        for (let key in views) viewNames.push(key);
        this.viewFolder.add(this.scene, 'init_camera', viewNames).name("Views").onChange(function (value) {
            this.scene.camera = this.scene.views[value];
            this.setActiveCamera(this.scene.camera);
        }.bind(this));

        this.viewFolder.close();
    }

    lightGUI() {

        if(this.lightFolder) this.emptyFolder(this.lightFolder);
        else this.lightFolder = this.gui.addFolder("LightControl");

        for (const light of this.scene.lights) {
            if (this.scene.accessGraph().lights[light.name] === undefined) continue;
            if (light.enabled) this.lightFolder.add(light, 'enabled').name(light.name);
            else this.lightFolder.add(light, 'enabled').name(light.name).listen();
        }
        this.lightFolder.open();
    }

    highlightGUI() {
        if(this.highlightFolder) this.emptyFolder(this.highlightFolder);
        else this.highlightFolder = this.gui.addFolder("HighlightControl");

        let highlightableObjects = this.scene.components;
        highlightableObjects = Array.from(highlightableObjects.values()).filter((component) => component.hasHighlight);

        for (const component of highlightableObjects) {
            const componentHighLightFolder = this.highlightFolder.addFolder(component.id);
            if (component.hightlight) componentHighLightFolder.add(component, 'highlight').name(component.id);
            else componentHighLightFolder.add(component, 'highlight').name(component.id).listen();

            componentHighLightFolder.addColor(component, 'highlightColor').name("Color").onChange(function (value) {
                component.highlightColor = value;
            }.bind(component));

            component.highlightColor = component.highlightColor.map((value) => value * 255);

            componentHighLightFolder.add(component, 'highlightScale', 0.1, 4).name("Scale Factor").onChange(function (value) {
                component.highlightScale = value;
            }.bind(component));

        }
        this.highlightFolder.close();
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




    emptyFolder(folder) {
        while (folder.__controllers.length > 0) folder.remove(folder.__controllers[0]);
    }


}