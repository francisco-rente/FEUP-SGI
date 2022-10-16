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
        this.lightGUI();
        this.viewGUI();
    }


    viewGUI() {
        let viewFolder = this.gui.addFolder("ViewControl");

        console.log("Interface initialized");

        this.scene.camera = this.scene.graph.views[this.scene.graph.defaultView];
        this.setActiveCamera(this.scene.camera);

        let views = this.scene.views;
        let viewNames = [];
        for (let key in views) viewNames.push(key);
        viewFolder.add(this, 'activeCamera', viewNames).name("Views").onChange(function (value) {
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

}