// Our class will extend this one so it can trigger events when resize occurs
import EventEmitter from "./EventEmitter.js"

export default class Sizes extends EventEmitter {
    constructor() {
        
        // Call the super so we can use the constructor of the parent class (EventEmitter)
        super()

        // Basic properties 
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        // Handle Resize
        window.addEventListener("resize", () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)

            // Trigger event when resize occurs
            this.trigger("resize")
        })
    }
}