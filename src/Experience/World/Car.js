import * as THREE from "three"
import Experience from "../Experience.js"

export default class Car {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.time = this.experience.time
		this.camera = this.experience.camera
		this.physics = this.experience.physics

		// input keys object and pressing state
		this.keys = {
			forward: false,
			backward: false,
			left: false,
			right: false,
		}

		this.setCar()

		// call key down and up method and pass event.
		window.addEventListener("keydown", (e) => this.onKeyDown(e))
		window.addEventListener("keyup", (e) => this.onKeyUp(e))

		this.setFollowSettings()
		this.setPhysics()
	}

	setCar() {
		this.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 2),
			new THREE.MeshNormalMaterial(),
		)
		this.mesh.position.y = 0.5
		this.scene.add(this.mesh)

		// movement
		this.speed = 0
		this.facingAngle = 0

		// adjustables (put them in debug ui)
		this.maxSpeed = 8
		this.maxReversedSpeed = 4
		this.acceleration = 6
		this.friction = 6
		this.turnSpeed = 2.5
	}

	onKeyDown(e) {
		if (e.key === "ArrowUp" || e.code === "KeyW") this.keys.forward = true
		if (e.key === "ArrowDown" || e.code === "KeyS")
			this.keys.backward = true
		if (e.key === "ArrowLeft" || e.code === "KeyA") this.keys.left = true
		if (e.key === "ArrowRight" || e.code === "KeyD") this.keys.right = true
	}

	onKeyUp(e) {
		if (e.key === "ArrowUp" || e.code === "KeyW") this.keys.forward = false
		if (e.key === "ArrowDown" || e.code === "KeyS")
			this.keys.backward = false
		if (e.key === "ArrowLeft" || e.code === "KeyA") this.keys.left = false
		if (e.key === "ArrowRight" || e.code === "KeyD") this.keys.right = false
	}

	setPhysics() {
		this.physicsObject = this.physics.addPhysics(
			this.mesh,
			"kinematicPositionBased",
			false,
			undefined,
			"cuboid",
			{ width: 0.5, height: 0.5, depth: 1 },
		)
	}

	updateSpeed(delta) {
		// We are using delta time to accelerate and decelerate. (it gives real world feel because cars take time to reach it's full speed.)
		// delta values is around 0.16. so on each frame we are adding this.acceleration * 0.16 to our speed.
		if (this.keys.forward) {
			this.speed += this.acceleration * delta
		} else if (this.keys.backward) {
			this.speed -= this.acceleration * delta
		} else {
			if (this.speed > 0)
				this.speed = Math.max(0, this.speed - this.friction * delta)
			else if (this.speed < 0)
				this.speed = Math.min(0, this.speed + this.friction * delta)
		}
		this.speed = THREE.MathUtils.clamp(
			this.speed,
			-this.maxReversedSpeed,
			this.maxSpeed,
		)
	}

	updateFacing(delta) {
		if (this.speed === 0) return

		// direction change depending on our car is going backward or forward
		const turnDirection = this.speed > 0 ? 1 : -1

		// same detla time usage so changes feel real.
		if (this.keys.left)
			this.facingAngle += this.turnSpeed * delta * turnDirection
		if (this.keys.right)
			this.facingAngle -= this.turnSpeed * delta * turnDirection
	}

	updatePosition(delta) {
		// so if we are going forward and backward it means we have to move our object in z axis.
		// For the turn we have to rotate the object in y axis.
		const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
			new THREE.Vector3(0, 1, 0),
			this.facingAngle,
		)

		const movement = forward.multiplyScalar(this.speed * delta)

		// Step 4: push uncorrected movement straight into the kinematic body (no collision yet)
		const pos = this.physicsObject.rigidBody.translation()
		this.physicsObject.rigidBody.setNextKinematicTranslation({
			x: pos.x + movement.x,
			y: pos.y + movement.y,
			z: pos.z + movement.z,
		})

		// sync mesh from the body ourselves (autoAnimate is off)
		const newPos = this.physicsObject.rigidBody.translation()
		this.mesh.position.set(newPos.x, newPos.y, newPos.z)

		this.mesh.rotation.y = this.facingAngle
	}

	// Make camera to follow our car
	setFollowSettings() {
		this.followOffset = new THREE.Vector3(0, 2, 5)
		this.followLerp = 5
		this.lookAtLerp = 8

		this._desiredPosition = new THREE.Vector3()
		this._currentLookAt = new THREE.Vector3()
	}

	updateFollow(delta) {
		// rotate the offset vector to follow the car even car turns
		const rotatedOffset = this.followOffset
			.clone()
			.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.facingAngle)

		this._desiredPosition.copy(this.mesh.position).add(rotatedOffset)

		const posAlpha = 1 - Math.exp(-this.followLerp * delta)
		const lookAlpha = 1 - Math.exp(-this.lookAtLerp * delta)

		this.camera.instance.position.lerp(this._desiredPosition, posAlpha)

		this._currentLookAt.lerp(this.mesh.position, lookAlpha)
		this.camera.instance.lookAt(this._currentLookAt)
	}

	update() {
		// Our delta time is in miliseconds but we need in seconds so divide by 1000
		const delta = this.time.delta / 1000
		this.updateSpeed(delta)
		this.updateFacing(delta)
		this.updatePosition(delta)

		this.updateFollow(delta)
	}
}
