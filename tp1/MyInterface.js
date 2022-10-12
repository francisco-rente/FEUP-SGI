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
        let lightFolder = this.gui.addFolder("LightControl");
        for (const light of this.scene.lights)
            if (light.enabled) lightFolder.add(light, 'enabled').name(light.id);
            else lightFolder.add(light, 'enabled').name(light.id).listen();

        lightFolder.open();
        let viewFolder = this.gui.addFolder("ViewControl");

        console.log("Interface initialized");
        // create drop down menu for views
        let views = this.scene.views;
        let viewNames = [];
        for (let key in views) {
            console.log(key);
            viewNames.push(key);
        }
        viewFolder.add(this, 'activeCamera', viewNames).name("Views").onChange(function (value) {
            this.scene.camera = this.scene.views[value];
            this.setActiveCamera(this.scene.camera);
        }.bind(this));

        viewFolder.open();
        /*for (const camera of this.scene.graph.views) {
            viewFolder.add(this, 'activeCamera', this.scene.graph.views).name(camera).onChange(this.scene.updateCamera.bind(this.scene));
        }*/

        // add a group of controls (and open/expand by default)
        // this.gui.add(this.scene, 'lightsOn', this.scene.lights).onChange(this.scene.lights.bind(this.scene)).name('Lights On');
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