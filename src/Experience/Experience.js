import Sizes from "./Utils/Sizes.js"
import Time from "./Utils/Time.js"

export default class Experience {
	constructor(canvas) {
		// Global access
		window.experience = this

		// canvas
		this.canvas = canvas

		// Setup
		this.sizes = new Sizes()
		this.time = new Time()

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
	resize() {}

	update() {}
}
