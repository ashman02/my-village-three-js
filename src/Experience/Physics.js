import Experience from "./Experience.js"

export default class Physics {
	constructor() {
		this.experience = new Experience()
        this.RAPIER = this.experience.RAPIER
		this.setInstance()
	}
	// Rapier needs to be initialized before we can use it. We have to wait for it to be ready
	setInstance() {
		let gravity = { x: 0.0, y: -9.81, z: 0.0 }
		this.world = new this.RAPIER.World(gravity)
	}

	update() {
		if (this.world) {
			this.world.step()
		}
	}
}
