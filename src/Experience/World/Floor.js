import * as THREE from "three"
import Experience from "../Experience.js"

export default class Floor {
    constructor(){
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.setFloor()
    }
    setFloor(){
        this.instance = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({
                color: "#fff"
            })
        )
        this.instance.rotation.x = - Math.PI * 0.5
        this.scene.add(this.instance)
    }
}