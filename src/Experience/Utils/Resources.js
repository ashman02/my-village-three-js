import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import EventEmitter from "./EventEmitter.js"

export default class Resources extends EventEmitter {
	constructor(sources) {
		super()

		this.sources = sources

		// setup
		this.items = {}
		this.toLoad = this.sources.length
		this.loaded = 0

		this.setLoaders()
		this.startLoading()
	}
	// Set loaders needed
	setLoaders() {
		this.loaders = {}
		this.loaders.gltfLoader = new GLTFLoader()
		this.loaders.textureLoader = new THREE.TextureLoader()
	}

	// Start loading using correspoding loader
	startLoading() {
		// Loop through all our sources
		for (const source of this.sources) {
			// Use if else to identify the source and use appropriet loader
			if (source.type === "gltfModel") {
				this.loaders.gltfLoader.load(source.path, (file) => {
					this.sourceLoaded(source, file)
				})
			} else if (source.type === "texture") {
				this.loaders.textureLoader.load(source.path, (file) => {
					this.sourceLoaded(source, file)
				})
			}
		}
	}

	// handle asset loaded
	sourceLoaded(source, file) {
		this.items[source.name] = file

		this.loaded++

		if (this.loaded === this.toLoad) {
			this.trigger("ready")
		}
	}
}
