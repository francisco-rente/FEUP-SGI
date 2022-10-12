import {CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader} from '../lib/CGF.js';
import {MyRectangle} from './primitives/MyRectangle.js';
import {MySphere} from './primitives/MySphere.js';
import {MyCylinder} from './primitives/MyCylinder.js';
import {MyTorus} from "./primitives/MyTorus.js";
import {MyTriangle} from "./primitives/MyTriangle.js";
import {MyComponent} from "./MyComponent.js";


var DEGREE_TO_RAD = Math.PI / 180.0;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.components = [];

        this.idRoot = null; // The id of the root element.

        this.textures = [];

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }


    clear_data() {
        if (this.textures.length !== 0)
            for (let texture of this.textures) texture.destroy();
    }


    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();

        return rootElement;
    }


    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        this.clear_data();

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block.
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        this.onXMLMinorError("To do: Parse views and create cameras.");
        this.defaultView = this.reader.getString(viewsNode, 'default');
        this.views = {};
        const children = viewsNode.children;


        console.log("Parsing views");

        // var constant = this.reader.getFloat(grandChildren[attributeIndex], 'constant');
        // var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
        for (const child of children) {
            const id = this.reader.getString(child, 'id');
            const near = this.reader.getFloat(child, 'near');
            const far = this.reader.getFloat(child, 'far');

            if (child.nodeName === "perspective") {
                //TODO: error handling
                const angle = this.reader.getFloat(child, 'angle');

                let from = null;
                let to = null;

                for (const grandChild of child.children) {
                    if (grandChild.nodeName === "from") {
                        from = this.parseCoordinates3D(grandChild, "from");
                    }
                    else if (grandChild.nodeName === "to") {
                        to = this.parseCoordinates3D(grandChild, "to");
                    }
                    else {
                        this.onXMLMinorError("Unknown tag <" + grandChild.nodeName + ">.");
                    }
                }

                if(from == null || to == null || typeof from === 'string' || typeof to === 'string')  {
                    this.onXMLMinorError("Error parsing perspective view");
                    return "Missing from/to in perspective view";
                }
                if(this.views[id] != null) {
                    this.onXMLMinorError("View with id " + id + " already exists");
                    return "View with id " + id + " already exists";
                }
                this.views[id] = new CGFcamera(angle * DEGREE_TO_RAD, near, far, from, to);

            } else if (child.nodeName === "ortho") {
                const left = this.reader.getFloat(child, 'left');
                const right = this.reader.getFloat(child, 'right');
                const top = this.reader.getFloat(child, 'top');
                const bottom = this.reader.getFloat(child, 'bottom');

                let from = null;
                let to = null;
                let up = null;

                for (const grandChild of child.children) {
                    if (grandChild.nodeName === "from") {
                        from = this.parseCoordinates3D(grandChild, "from");
                    }
                    else if (grandChild.nodeName === "to") {
                        to = this.parseCoordinates3D(grandChild, "to");
                    }
                    else if (grandChild.nodeName === "up") {
                        up = this.parseCoordinates3D(grandChild, "up");
                    }
                    else {
                        this.onXMLMinorError("Unknown tag <" + grandChild.nodeName + ">.");
                    }
                }

                if(from == null || to == null || typeof from === 'string' || typeof to === 'string')  {
                    this.onXMLMinorError("Error parsing perspective view");
                    return "Missing from/to in perspective view";
                }

                if (typeof up === "string" || up === null) {
                    this.onXMLMinorError("up not found using default value (0, 1, 0)");
                    up = vec3.fromValues(0, 1, 0);
                }


                if(this.views[id] != null) {
                    this.onXMLMinorError("View with id " + id + " already exists");
                    return "View with id " + id + " already exists";
                }
                this.views[id] = (new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up));
            }
        }

        if(this.views[this.defaultView] == null) {
            this.onXMLMinorError("Default view not found");
            return "Default view not found";
        }


        /*<views default="ss" >
            <!-- tem de existir, pelo menos, uma vista de -->
            <!-- entre as seguintes (perspective ou ortho) -->
            <perspective id="ss" near="ff" far="ff" angle="ff">
                <from x="ff" y="ff" z="ff" />
                <to x="ff" y="ff" z="ff" />
            </perspective>



            <ortho id="ss"  near="ff" far="ff" left="ff" right="ff" top="ff" bottom="ff" >
                <from x="ff" y="ff" z="ff" />
                <to x="ff" y="ff" z="ff" />
                <up x="ff" y="ff" z="ff" /> <!-- opcional, default 0,1,0 -->
            </ortho>
        </views>*/
        console.log("Parsed views");

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light

            switch (children[i].nodeName) {
                case "omni":
                    attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                    attributeTypes.push(...["position", "color", "color", "color", "attenuation"]);
                    break;
                case "spot":
                    attributeNames.push(...["location", "target", "ambient", "diffuse", "specular", "attenuation"]);
                    attributeTypes.push(...["position", "position", "color", "color", "color", "attenuation"]);
                    break;
                default:
                    this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                    continue;
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);
                console.log("attri" + attributeTypes[j]);
                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position") {
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                        global.push(aux);
                    } else if (attributeTypes[j] == "color") {
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);
                        if (!Array.isArray(aux)) return aux;
                        global.push(aux);
                    }
                    // <attenuation constant="ff" linear="ff" quadratic="ff" />  
                    else if (attributeTypes[j] == "attenuation") {
                        var constant = this.reader.getFloat(grandChildren[attributeIndex], 'constant');
                        if (!(constant != null && !isNaN(constant))) return "unable to parse constant-coordinate of the " + messageError;
                        var linear = this.reader.getFloat(grandChildren[attributeIndex], 'linear');
                        if (!(linear != null && !isNaN(linear))) return "unable to parse constant-coordinate of the " + messageError;
                        var quadratic = this.reader.getFloat(grandChildren[attributeIndex], 'quadratic');
                        if (!(quadratic != null && !isNaN(quadratic))) return "unable to parse constant-coordinate of the " + messageError;

                        if (constant + linear + quadratic == 1.0)
                            global.push([constant, linear, quadratic])
                        else
                            this.onXMLMinorError("Only one attenuation component should be set to 1.0");
                        global.push([1.0, 0.0, 0.0])
                    }
                } else
                    return "light " + attributeNames[j] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spotlight
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                } else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            console.log(this.lights[lightId]);

            numLights++;
        }

        console.log(this.lights);
        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        // TODO : add default values for lights

        this.log("Parsed lights");

        return null;
    }

    /**
     * Parses the <textures> block.
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL
        this.onXMLMinorError("To do: Parse textures.");

        for (let texture of texturesNode.children) {
            const id = this.reader.getString(texture, 'id');
            if (id == null) return "no ID defined for texture";

            if (this.textures[id] != null)
                return "Repeated ID for texture: " + id;

            const textureFile = this.reader.getString(texture, 'file');
            if (textureFile == null) return "no file defined for texture";
            if (textureFile.length === 0) return "file path is empty";

            // check if file exists
            // const texture_file = new File("./scenes/images/" + textureFile, "r");
            // if (!texture_file.exists()) return "file " + textureFile + " does not exist";

            console.log("Texture " + id + "from " + textureFile + " loaded");
            this.textures[id] = new CGFtexture(this.scene, textureFile);
        }

        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            const materialID = this.reader.getString(children[i], 'id');
            if (materialID == null) return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";


            const material_properties = Array.from(children[i].children);
            const shininess = this.reader.getFloat(children[i], 'shininess');
            const emission = this.parseColor(material_properties.find(node => node.nodeName === "emission"),
                "emission for material " + materialID);
            const ambient = this.parseColor(material_properties.find(node => node.nodeName === "ambient"),
                "ambient for material " + materialID);
            const diffuse = this.parseColor(material_properties.find(node => node.nodeName === "diffuse"),
                "diffuse for material " + materialID);
            const specular = this.parseColor(material_properties.find(node => node.nodeName === "specular"),
                "specular for material " + materialID);

            const material = new CGFappearance(this.scene);
            material.setShininess(shininess);
            material.setEmission(emission[0], emission[1], emission[2], emission[3]);
            material.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
            material.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
            material.setSpecular(specular[0], specular[1], specular[2], specular[3]);

            this.materials[materialID] = material;
            console.log("Material " + materialID + " loaded");
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                let copy = mat4.clone(transfMatrix);
                transfMatrix = this.get_transformation_matrix(grandChildren[j], copy);
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }


    get_transformation_matrix(transformation_tag, transfMatrix) {
        switch (transformation_tag.nodeName) {

            case 'translate':
                var coordinates = this.parseCoordinates3D(transformation_tag, "translate transformation");
                if (!Array.isArray(coordinates))
                    return coordinates;
                let matrix_copy = mat4.clone(transfMatrix);
                mat4.translate(transfMatrix, matrix_copy, coordinates);
                break;
            case 'scale':
                var coordinates = this.parseCoordinates3D(transformation_tag, "translate transformation");
                console.log("To do: use fromScaling here. Found in documentation but not importing. Ask teacher");
                //mat4.fromScaling(transfMatrix, coordinates);
                mat4.scale(transfMatrix, transfMatrix, coordinates);
                break;
            case 'rotate':
                let axis = this.reader.getString(transformation_tag, 'axis');
                if (axis != 'x' && axis != 'y' && axis != 'z')
                    return transformation_tag;
                let angle = this.reader.getFloat(transformation_tag, 'angle');
                angle = DEGREE_TO_RAD * angle;
                console.log("To do: use fromRotation here. Found in documentation but not importing. Ask teacher");
                // mat4.fromRotation(transfMatrix, angle, axis);
                console.log(transfMatrix);
                switch (axis) {
                    case 'x':
                        mat4.rotateX(transfMatrix, transfMatrix, angle);
                        break;
                    case 'y':
                        mat4.rotateY(transfMatrix, transfMatrix, angle);
                        break;
                    case 'z':
                        mat4.rotateZ(transfMatrix, transfMatrix, angle);
                        break;
                    default:
                        return "Rotation with wrong axis";
                }
                break;
        }
        return transfMatrix;
    }


    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }


            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;


            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            } else if (primitiveType == 'sphere') {
                //radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius) && radius != 0))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;

                //slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices != 0))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                //stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks != 0))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;

            } else if (primitiveType == 'cylinder') {
                //base
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base) && base != 0))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                //top
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top) && top != 0))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                //height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height) && height != 0))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                //slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices != 0))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                //stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks != 0))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;


                var cylinder = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);

                this.primitives[primitiveId] = cylinder;

            } else if (primitiveType == 'torus') {
                //inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner) && inner != 0))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;

                //outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer) && outer != 0))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                //slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices != 0))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                //loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops) && loops != 0))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                var torus = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops)
                this.primitives[primitiveId] = torus;
            } else if (primitiveType === 'triangle') {
                /*<triangle   x1="ff" y1="ff" z1="ff"  x2="ff" y2="ff" z2="ff" x3="ff" y3="ff" z3="ff" /> */

                let x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;
                let y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;
                let z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                let x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;
                let y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;
                let z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;

                let x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;
                let y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;
                let z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                if (!MyTriangle.checkProperties(x1, y1, z1, x2, y2, z2, x3, y3, z3))
                    return "unable to parse triangle coordinates for ID = " + primitiveId;

                var triangle = new MyTriangle(this.scene, primitiveId, [x1, y1, z1], [x2, y2, z2], [x3, y3, z3]);

                this.primitives[primitiveId] = triangle;
                console.log("triangle added to primitives" + primitiveId);
            } else {
                console.warn("To do: Parse other primitives.");
            }
        }
        this.log("Parsed primitives");
        this.primitives[primitiveId].display();
        return null;
    }

    /**
     * Parses the <components> block.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {
        let children = componentsNode.children;

        this.components = []; //array of components ids

        let grandChildren = [];
        let grandGrandChildren = {}; //DICT: Pair NodeID -> [ChildComponentNodeID]
        let nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName !== "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) nodeNames.push(grandChildren[j].nodeName);


            const transformationIndex = nodeNames.indexOf("transformation");
            const materialsIndex = nodeNames.indexOf("materials");
            const textureIndex = nodeNames.indexOf("texture");
            const childrenIndex = nodeNames.indexOf("children");

            let component = new MyComponent(this.scene, componentID);
            this.onXMLMinorError("To do: Parse components.");
            // Transformations

            let matrix = mat4.create();
            let transformations = grandChildren[transformationIndex].children;

            for (const transformation of transformations) {

                if (transformation.nodeName === 'transformationref') {
                    let transformationID = this.reader.getString(transformation, 'id');
                    mat4.multiply(matrix, matrix, this.transformations[transformationID])
                } else {
                    let copied = mat4.clone(matrix);
                    // mat4.multiply(new_matrix, matrix, this.get_transformation_matrix(transformation, copied));
                    matrix = this.get_transformation_matrix(transformation, copied);
                }

            }


            console.log("matrix: " + matrix + " componentID: " + componentID);
            component.transformation = matrix;


            // Materials
            /*
               - mandatory material declaration
               - inherit -> inherits parents material
               - if multiple declared, default is the first one
               - when multiple declared, when M/m is pressed it cycles through them
               - M/m should be perpetuated to every node
            */

            let success = true, string = "";
            console.log("PARSING MATERIALS: " + componentID);
            console.log(grandChildren[materialsIndex]);
            [success, string] = this.parseMaterialNode(grandChildren[materialsIndex], component);
            if (!success) return string;

            // Texture
            [success, string] = this.parseTextureNode(grandChildren[textureIndex], component);
            if (!success) return string;

            //TODO:how to pass coordinates to primitives?
            // Where do we define the inheritance of texture coordinates?
            // Are they passed directly to the primitives in the primitiveref to some sort of stack or dict?
            // Are the textures changed only with push pop operations?

            // inherit - keeps the parent texture and dimensions
            // none - removes the parent texture
            // else overrides the parent texture
            // length_s height, length_t width
            // if inherit or none then no length_t or length_s are declared
            // if inherit get parent texture coordinates
            // <texture id="ss" length_s="ff" length_t="ff"/>

            // Children
            if (!grandChildren[childrenIndex]) return "Children must be declared in each component";

            // starts the array of components references, in <children>
            grandGrandChildren[componentID] = [];
            const grandGrandChildrenTags = grandChildren[childrenIndex].children; // <componentref/primitiveref> children
            for (let child of grandGrandChildrenTags) {
                if (child.nodeName === "componentref") {
                    let componentRef = this.reader.getString(child, 'id');
                    grandGrandChildren[componentID].push(componentRef); // { componentID -> [componentRef...] }
                } else if (child.nodeName === "primitiveref") {
                    // primitives already parsed and in this.primitives array as objects (DOUBT: Hopefully)
                    let primitiveID = this.reader.getString(child, 'id');
                    component.addPrimitive(this.primitives[primitiveID]);
                } else {
                    return "Unknown tag <" + child.nodeName + ">";
                }
                // TODO: other options?
            }
            //TODO: verify repeated
            this.components.push(component); // <component> parsed, added to components array
        }

        // Go through the dict CompId -> [ChildCompId] and add the children to the components Objects
        // created in the loop above
        for (let compId in grandGrandChildren) //<component> id
            for (let childComp of grandGrandChildren[compId]) { //<componentref> ids
                let childCompObj = this.components.find(comp => comp.id === childComp);
                // console.log("Adding child " + childCompObj + " to " + compId);
                // add the component object (parsed in the loop above) to the parent component
                // TODO: check here for recursive component connections?
                this.components.find(comp => comp.id === compId).addChild(childCompObj);
            }
    }

    parseMaterialNode(materials_tag, component) {
        /*
           - mandatory material declaration
           - inherit -> inherits parents material
           - if multiple declared, default is the first one
           - when multiple declared, when M/m is pressed it cycles through them
           - M/m should be perpetuated to every node
        */

        let materials = materials_tag.children;
        if (materials.length === 0) return [false, "At least one material must be declared in each component"];
        for (const material of materials) {
            if (material.nodeName === 'material') {
                let materialID = this.reader.getString(material, 'id');
                if (materialID === 'inherit') component.addMaterial('inherit');
                else {
                    if (!this.materials[materialID]) return [false, "Material " + materialID + " not found"];
                    component.addMaterial(this.materials[materialID])
                }

                console.log("materialID: " + materialID + "for " + component.id);
            } else return [false, "Unknown tag <" + material.nodeName + ">"];
        }
        return [true, null];
    }

    parseTextureNode(texture_info, component) {
        // get texture info in each loop child node (from its component's children)
        // let texture_info = grandChildren[textureIndex];
        if (!texture_info)
            return [false, "Texture must be declared in each component"]; // MANDATORY DECLARATION

        let texture_id = this.reader.getString(texture_info, 'id');

        let length_s = null,
            length_t = null;
        if (this.reader.hasAttribute(texture_info, 'length_s') &&
            this.reader.hasAttribute(texture_info, 'length_t')) {
            length_s = this.reader.getFloat(texture_info, 'length_s');
            length_t = this.reader.getFloat(texture_info, 'length_t');

            this.log("length_s: " + length_s + " length_t: " + length_t);
            if (0 > length_s > 1 && 0 > length_t > 1)
                return [false, "Texture length_s and length_t must be between 0 and 1"];
        }

        if (texture_id === 'inherit' || texture_id === 'none') {
            component.setTexture(texture_id);
            if (length_s !== null || length_t !== null)
                this.onXMLMinorError("Texture length_s and length_t are not applicable to inherit or none");
            // console.log("Component " + component.id + " has implicit texture " + texture_id);
        } else {
            if (length_t === null || length_s === null)
                return [false, "Texture length_s and length_t must be declared"];
            /* console.log("Component " + component.id + " has texture " + texture_id +
             " with length_s " + length_s + " and length_t " + length_t);*/
            if (this.textures[texture_id] === undefined) return [false, "Texture " + texture_id + " not found"];
            component.setTexture(this.textures[texture_id]);
            component.setTextureCoordinates([length_s, length_t]);
        }
        // TODO: default texture
        if (typeof component.getTexture() == "undefined")
            return [false, `Texture ${texture_id} not found`];

        console.log("Parsed texture reference: " + texture_id + " for component " + component.id);
        return [true, null]
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        //To do: Create display loop for traversing the scene graph
        // console.log(this.idRoot)

        //console.log(this.components.find(comp => comp.id === this.idRoot))
        this.components.find(comp => comp.id === this.idRoot).display();
        //To test the parsing/creation of the primitives, call the display function directly

        //this.primitives['demoRectangle'].display();
        // this.primitives['aSphere'].display();
        //this.primitives['aCylinder'].display();
        //this.primitives['aTriangle'].display();
        //this.primitives['aTorus'].display();
    }


}