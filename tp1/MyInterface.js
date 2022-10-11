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

        let lightFolder = this.gui.addFolder("LightControl");
        for (const light of this.scene.lights)
            if (light.enabled) lightFolder.add(light, 'enabled').name(light.id);
            else lightFolder.add(light, 'enabled').name(light.id).listen();

        lightFolder.open();
        console.log("Interface initialized");
        this.gui.addFolder("CameraControl");

        // add a group of controls (and open/expand by default)
        // this.gui.add(this.scene, 'lightsOn', this.scene.lights).onChange(this.scene.lights.bind(this.scene)).name('Lights On');

        this.initKeys();

        return true;
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