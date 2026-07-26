/**
 * sources.js file 
 * We are going to use an array to load our assets. Each resource in the array will be defined by an object composed of the following properties - 
 * - name : which will be used to retrieve the loaded resource
 * - type : in order to know what loader to use
 * - path : the path(s) of the file(s) to load
 * - example -> [
 *                 {
                    name : "environmentMapTexture",
                    type : "cubeTexture", 
                    path : [
                        "/textures/environmentMap/px.jpg",
                        "/textures/environmentMap/nx.jpg",
                        "/textures/environmentMap/py.jpg",
                        "/textures/environmentMap/ny.jpg",
                        "/textures/environmentMap/pz.jpg",
                        "/textures/environmentMap/nz.jpg"
                    ]
                   },
                   {
                    name : "grassColorTexture",
                    type : "texture",
                    path : "/textures/dirt/color.jpg"
                   },
                   {
                    name : "foxModel",
                    type : "gltfModel",
                    path : "/models/Fox/glTF/Fox.gltf"
                   }
                ]
 * 
 * In this file we are going to create that array and export it. 
 * Import that array in Experience class and then send to Resources class as a parameter.
 * 
 */

export default []
