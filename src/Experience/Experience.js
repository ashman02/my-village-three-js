import * as THREE from "three"
import Sizes from "./Utils/Sizes.js"
import Time from "./Utils/Time.js"
import Camera from "./Camera.js"
import Renderer from "./Renderer.js"
import World from "./World/World.js"
import Resources from "./Utils/Resources.js"
import sources from "./sources.js"
import Debug from "./Utils/Debug.js"
import Physics from "./Physics.js"

let instance = null

export default class Experience {
	constructor(canvas) {
		// Singleton
		if (instance) {
			return instance
		}

		instance = this

		this.init(canvas)
	}

	async init(canvas) {
		// Global access
		window.experience = this

		// canvas
		this.canvas = canvas

		// Setup
		this.debug = new Debug()
		this.sizes = new Sizes()
		this.time = new Time()
		this.scene = new THREE.Scene()
		this.resources = new Resources(sources)
		this.camera = new Camera()
		this.renderer = new Renderer()

		// Initialize rapier
		const rapierPromise = await import("@dimforge/rapier3d")
		this.RAPIER = rapierPromise
		this.physics = new Physics()
		this.world = new World()

		/**
		 * Event Listeners
		 * 1. resize from Sizes class
		 * 2. tick from Time class
		 */
		// Listen to resize event from Sizes class and call resize method
		this.sizes.on("resize", () => {
			this.resize()
		})

		// Listen to tick event from Time class and class update method
		this.time.on("tick", () => {
			this.update()
		})
	}

	/**
	 * Methods
	 * 1. Resize - Will be called when window is resized
	 * 2. Update - Will be called on each frame
	 */
	resize() {
		this.camera.resize()
		this.renderer.resize()
	}

	update() {
		this.physics.update()
		this.world.update()
		// For orbit controls
		this.camera.update()
		this.renderer.update()
	}
}
