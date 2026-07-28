import Experience from "./Experience.js"

export default class Physics {
	constructor() {
		this.experience = new Experience()
		this.RAPIER = this.experience.RAPIER

		// Store all the physics objects indside this array
		this.physicsObjects = []

		this.setInstance()
	}
	// Rapier needs to be initialized before we can use it. We have to wait for it to be ready
	setInstance() {
		let gravity = { x: 0.0, y: -9.81, z: 0.0 }
		this.world = new this.RAPIER.World(gravity)

		// Character controller
		this.characterController = this.world.createCharacterController(0.01)
		this.characterController.setSlideEnabled(true)
		this.characterController.setMaxSlopeClimbAngle(45 * Math.PI / 180)
		this.characterController.setMinSlopeSlideAngle(30 * Math.PI / 180)
		this.characterController.enableAutostep(0.3, 0.2, true)
		this.characterController.setApplyImpulsesToDynamicBodies(true)
	}

	// Function that adds physics to the objects
	addPhysics(
		mesh,
		rigidBodyType,
		autoAnimate,
		postPhysicsFn,
		colliderType,
		colliderSettings,
	) {
		// Create RigidBody Desc
		const rigidBodyDesc = this.RAPIER.RigidBodyDesc[rigidBodyType]()
		rigidBodyDesc.setTranslation(
			mesh.position.x,
			mesh.position.y,
			mesh.position.z,
		)

		// Responsible for collider response
		const rigidBody = this.world.createRigidBody(rigidBodyDesc)

		// Collider
		let colliderDesc

		switch (colliderType) {
			case "cuboid":
				{
					const { width, height, depth } = colliderSettings
					colliderDesc = this.RAPIER.ColliderDesc.cuboid(
						width,
						height,
						depth,
					)
				}
				break

			case "ball":
				{
					const { radius } = colliderSettings
					colliderDesc = this.RAPIER.ColliderDesc.ball(radius)
				}
				break

			case "capsule":
				{
					const { halfHeight, radius } = colliderSettings
					colliderDesc = this.RAPIER.ColliderDesc.capsule(
						halfHeight,
						radius,
					)
				}
				break

			default:
				{
					colliderDesc = this.RAPIER.ColliderDesc.trimesh(
						mesh.geometry.attributes.position.array,
						mesh.geometry.index.array,
					)
				}
				break
		}

		if (!colliderDesc) {
			console.error("Collider mesh error : convex mesh creation failed")
		}

		// resposible for collision response
		const collider = this.world.createCollider(colliderDesc, rigidBody)

		const physicsObject = {
			mesh,
			collider,
			rigidBody,
			fn: postPhysicsFn,
			autoAnimate,
		}

		this.physicsObjects.push(physicsObject)

		return physicsObject
	}

	update() {
		if (this.world) {
			this.world.step()

			// copy translation values of physics objects to mesh objects
			for (let obj of this.physicsObjects) {
				const autoAnimate = obj.autoAnimate

				if (autoAnimate) {
					const mesh = obj.mesh
					const collider = obj.collider
					mesh.position.copy(collider.translation())
					mesh.quaternion.copy(collider.rotation())
				}

				const fn = obj.fn
				fn && fn()
			}
		}
	}
}
