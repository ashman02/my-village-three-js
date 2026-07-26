import * as THREE from "three"
import Sizes from "./Utils/Sizes.js"
import Time from "./Utils/Time.js"
import Camera from "./Camera.js"
import Renderer from "./Renderer.js"

let instance = null

export default class Experience {
	constructor(canvas) {

		// Singleton
		if(instance){
			return instance
		}

		instance = this

		// Global access
		window.experience = this

		// canvas
		this.canvas = canvas

		// Setup
		this.sizes = new Sizes()
		this.time = new Time()
		this.scene = new THREE.Scene()
		this.camera = new Camera()
		this.renderer = new Renderer()

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
		// For orbit controls
		this.camera.update()
		this.renderer.update()
	}
}
