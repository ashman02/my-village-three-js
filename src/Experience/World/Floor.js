import * as THREE from "three"
import Experience from "../Experience.js"

let planeWidth = 10
let planeHeight = 10

export default class Floor {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.physics = this.experience.physics

		this.setGeometry()
		this.setMaterial()
		this.setMesh()
		this.getPhysics()
	}
	setGeometry() {
		this.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
	}
	setMaterial() {
		this.material = new THREE.MeshBasicMaterial({
			color: "#fff",
		})
	}
	setMesh() {
		this.mesh = new THREE.Mesh(this.geometry, this.material)
		this.mesh.rotation.x = -Math.PI * 0.5
		this.scene.add(this.mesh)
	}
	getPhysics() {
		this.physics.addPhysics(this.mesh, "fixed", false, () => {}, "cuboid", {
			width: planeWidth / 2,
			height: 0.001,
			depth: planeHeight / 2,
		})
	}
}
