import EventEmitter from "./EventEmitter.js"

export default class Time extends EventEmitter {
	constructor() {
		super()

		// Setup
		this.start = new Date()
		this.current = this.start
		this.elapsed = 0
		// why 16? He does not set it to 0 because it can cause some issues in the first frame. So he set it to 16 (which is the delta time between each frame at 60fps)
		this.delta = 16

		// Call tick method.
		// We are not calling it directly because sometimes delta time can be 0 on first frame (which is harmless but some time it can cause some issues in the first frame). So we are calling it on the next frame using requestAnimationFrame.
		window.requestAnimationFrame(() => {
			this.tick()
		})
	}
	tick() {
		// Update properties
		const currentTime = Date.now()
		this.delta = currentTime - this.current
		this.current = currentTime
		this.elapsed = this.current - this.start

        // Trigger event
        this.trigger("tick")

        // call the tick function on each frame
        window.requestAnimationFrame(() => {
            this.tick()
        })
	}
}
