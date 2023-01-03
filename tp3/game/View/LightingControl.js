export class LightingControl {

    constructor(scene, size) {
        this.scene = scene;
        this.size = size;
        this.spotLight = this.scene.lights[7];
        this.errorLight = this.scene.lights[6];
        this.createErrorLightParams();
    }


    toggleErrorLight() {
        this.errorLight.enabled ? this.errorLight.disable() : this.errorLight.enable();
    }

    disableErrorLight() {
        this.errorLight.disable();
    }

    enableErrorLight() {
        this.errorLight.enable();
    }

    createErrorLightParams() {
        this.errorLight.setPosition(0, 0, 0, 1);
        this.errorLight.setAmbient(1.0, 0.0, 0.0, 1);
        this.errorLight.setDiffuse(1.0, 0.0, 0.0, 1);
        this.errorLight.setSpecular(1.0, 0.0, 0.0, 1);
        this.spotLight.setConstantAttenuation(1);
        this.spotLight.setVisible(true);
        this.spotLight.update();
        this.errorLight.disable();
    }


    setSpotLightParams() {
        this.spotLight.setAmbient(0.0, 0.0, 0.0, 1);
        this.spotLight.setDiffuse(1.0, 1.0, 0.5, 0.2);
        this.spotLight.setSpecular(1.0, 1.0, 0.2, 0.7);

        this.spotLight.setConstantAttenuation(1);
        this.spotLight.setLinearAttenuation(0);
        this.spotLight.setQuadraticAttenuation(0);

        this.spotLight.setSpotDirection(0, -1, 0);
        this.spotLight.setSpotCutOff(10);
        this.spotLight.setSpotExponent(5);
        this.spotLight.setVisible(true);
        this.spotLight.update();
    }

    createSpotLight(boardOffset) {
        this.spotLightInfo = {
            "initial_position": [this.size[0] / 2 + boardOffset, 3, this.size[1], 1],
            "position": [0, 0, 0]
        }
        const [x, y, z] = this.spotLightInfo["initial_position"];
        this.spotLight.setPosition(x, y, z, 1);
        this.setSpotLightParams();
        this.spotLight.enable();
    }

    redirectSpotLight(newLightPosition) {
        const [x, z] = newLightPosition;
        this.spotLight = this.scene.lights[7];
        this.spotLightInfo["position"] = newLightPosition;
        this.spotLight.setPosition(x, this.spotLightInfo["initial_position"][1], z, 1);
        this.setSpotLightParams();
        this.spotLight.enable();
    }

    reset(disable = false) {
        const [x, y, z] = this.spotLightInfo["initial_position"];
        this.spotLight.setPosition(x, y, z, 1);
        this.setSpotLightParams();
        this.spotLight.update();
        if (disable) this.spotLight.disable();
        else this.spotLight.enable();
    }

}