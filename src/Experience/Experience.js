
import Sizes from "./Utils/Sizes.js"

export default class Experience {
    constructor(canvas) {
        
        // Global access
        window.experience = this

        // canvas
        this.canvas = canvas

        // Setup 
        this.sizes = new Sizes()

        // Listen to resize event from Sizes class and call resize method
        this.sizes.on("resize", () => {
            this.resize()
        })

    }

    /**
     * Methods
     * 1. Resize - Will be called when window is resized
     */
    resize(){
        console.log("resize")
    }
}