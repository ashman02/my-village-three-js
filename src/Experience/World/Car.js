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
		this.mesh.position.y = 1
		this.scene.add(this.mesh)

		// movement
		this.speed = 0
		this.facingAngle = 0

		// adjustables (put them in debug ui)
		this.maxSpeed = 8 // max speed of the car
		this.maxReversedSpeed = 4 // max speed in reverse
		this.acceleration = 6 // how much time it takes to reach max speed
		this.friction = 6 // how much time it takes to stop once we let go of a key
		this.turnSpeed = 2.5 // how fast the car turns
	}

	// Find out which key is pressed and set the corresponding value to true
	onKeyDown(e) {
		// using e.code instead of e.key because e.key is inconsistent across keyboards (querty, azerty etc.)
		if (e.key === "ArrowUp" || e.code === "KeyW") this.keys.forward = true
		if (e.key === "ArrowDown" || e.code === "KeyS")
			this.keys.backward = true
		if (e.key === "ArrowLeft" || e.code === "KeyA") this.keys.left = true
		if (e.key === "ArrowRight" || e.code === "KeyD") this.keys.right = true
	}

	// Find out which key is released and set the corresponding value to false
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
		// delta value is around 0.16. so on each frame we are adding this.acceleration * 0.16 to our speed.
		if (this.keys.forward) {
			this.speed += this.acceleration * delta
		} else if (this.keys.backward) {
			this.speed -= this.acceleration * delta
		} else {
			// if we are not pressing any key but still there is some speed we are decelerating it.
			if (this.speed > 0)
				this.speed = Math.max(0, this.speed - this.friction * delta)
			else if (this.speed < 0)
				this.speed = Math.min(0, this.speed + this.friction * delta)
		}
		// clamp the value between max speed and max reversed speed
		this.speed = THREE.MathUtils.clamp(
			this.speed,
			-this.maxReversedSpeed,
			this.maxSpeed,
		)
	}

	updateFacing(delta) {
		if (this.speed === 0) return

		// direction change depending on our car is going backward or forward  (real world feel)
		const turnDirection = this.speed > 0 ? 1 : -1

		// same detla time we are using to accelerate and decelerate. But this time we are using it to turn the car.
		// One more thing to note this is rotation on y axis. So on left key press we are adding values and or right key press we are subtracting.
		if (this.keys.left)
			this.facingAngle += this.turnSpeed * delta * turnDirection
		if (this.keys.right)
			this.facingAngle -= this.turnSpeed * delta * turnDirection
	}

	updatePosition(delta) {
		/**
		 * Direction our car facing in 3D space
		 * 1. First vector (0, 0, -1) - this is base vector. In three js Z is considered forward direction. This repesents where your car would face if it had not turned at all.
		 * 2. Second vector (0, 1, 0) - When we turn our car left or right we need to rotate it on Y axis. So this vector point towards Y axis.
		 * 3. .applyAxisAngle - this method will rotate our initial forward vector on Y axis based on angle.
		 *
		 * - Scenario A: this.facingAngle = 0 (No turn)
		 * --- Start vector: (0, 0, -1)
		 * --- Rotate by 0 radians around Y-axis.
		 * --- Result: (0, 0, -1)
		 * --- Movement: Driving straight ahead along the negative Z-axis.
		 *
		 * - Scenario B: this.facingAngle = Math.PI / 2 (around 1.57) (Turned 90° Left)
		 * --- Start vector: (0, 0, -1)
		 * --- Rotate 90 degrees counter-clockwise around the Y-axis.
		 * --- Result: (-1, 0, 0)
		 * --- Movement: The car is now facing West (negative X-axis). Moving forward now increases your distance along -X.
		 *
		 * - Scenario C: this.facingAngle = Math.PI / 4 (Turned 45° Left)
		 * --- Start vector: (0, 0, -1)
		 * --- Rotate $45 degrees around the Y-axis.
		 * --- Result: (-0.707, 0, -0.707)
		 * --- Movement: The car drives diagonally up and left (North-West).
		 *
		 */
		const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
			new THREE.Vector3(0, 1, 0),
			this.facingAngle,
		)

		/**
		 * - this.speed * delta = distance in units. So if our speed is 8 and delta is 0.016 then we are moving 0.128 units in this frame.
		 *
		 * - multiplyScalar - this method multiplies each component (x,y,z) of the vector by that number.
		 *
		 * - Suppose your car is facing 45° to the left (North-West) and moving forward at top speed:
		 * --- Forward direction vector (forward):(-0.707, 0, -0.707) (Length = 1.0)
		 * --- Speed & Delta: speed = 10 units/sec, delta = 0.016sec (60 FPS)
		 * ----- Distance = 10 * 0.016 = 0.16units
		 * --- Applying multiplyScalar(0.16) :
		 * ----- desiredMovement = (-0.707 * 0.16, 0 * 0.16, -0.707 * 0.16)
		 * ----- desiredMovement = (-0.113, 0, -0.113)
		 *
		 */
		const desiredMovement = forward.multiplyScalar(this.speed * delta)

		// Pass desired movement to the character controller so that it can compute corrected movement. (checks if there are any obstacles in the way)
		this.physics.characterController.computeColliderMovement(
			this.physicsObject.collider,
			desiredMovement,
		)

		// get corrected movement
		const corrected = this.physics.characterController.computedMovement()

		// NEW: push any dynamic bodies the controller detected as obstacles
		this.applyPushForces()

		// Get the current position of the car
		const pos = this.physicsObject.rigidBody.translation()

		// Calculate the new position. 
		// It should be same as desiredMovement if there was no collision.
		// If there was a collision, it should be corrected 
		const newPos = {
			x: pos.x + corrected.x,
			y: pos.y + corrected.y,
			z: pos.z + corrected.z,
		}

		// Move the rigid body (car) to the new position on next world.step (on next frame)
		this.physicsObject.rigidBody.setNextKinematicTranslation(newPos)

		// sync mesh directly — no need to wait for world.step() and read it back
		// We might be wrong here but it works. If you see any failure put this in world.step
		this.mesh.position.set(newPos.x, newPos.y, newPos.z)
		this.mesh.rotation.y = this.facingAngle
	}

	// Because your car is a kinematic body, physics engines treat it like an unstoppable bulldozer: when it runs into dynamic objects (like boxes, barrels, or traffic cones), it won't naturally bounce off or push them.
	applyPushForces() {
		const controller = this.physics.characterController

		// Our controller recorded every surface or obstacles our car touched during that frame.
		const count = controller.numComputedCollisions()

		// go through each obstacle
		for (let i = 0; i < count; i++) {
			const collision = controller.computedCollision(i)
			const hitCollider = collision.collider
			const hitBody = hitCollider.parent()

			// check if the obstacle is dynamic
			if (
				!hitBody ||
				hitBody.bodyType() !== this.physics.RAPIER.RigidBodyType.Dynamic
			) {
				continue // skip static/fixed obstacles — nothing to push
			}

			// push direction: away from the car, along the collision normal
			const pushStrength = 1.5 // tune this - we can use car speed as well. 
			//normal1 is the collision vector pointing from the hit obstacle to the car. So we will reverse it by multiplying with (-). so it points away from the car to the hit object.
			const impulse = {
				x: -collision.normal1.x * pushStrength,
				y: 0, // usually keep pushes horizontal so you don't launch things upward
				z: -collision.normal1.z * pushStrength,
			}
			// apply impluse and wake up the body if it was sleeping
			hitBody.applyImpulse(impulse, true)
		}
	}

	// Make camera to follow our car
	setFollowSettings() {
		this.followOffset = new THREE.Vector3(0, 2, 5) // where our camera sits relative to the car.

		// smooth follow. lower is more smooth. 
		this.followLerp = 5 
		this.lookAtLerp = 8
		
		// reusable vectors to prevent memory allocation every frame.  
		this._desiredPosition = new THREE.Vector3()
		this._currentLookAt = new THREE.Vector3()
	}

	updateFollow(delta) {
		// rotate the offset vector to follow the car even car turns
		// Same logic as in updatePosition (for more deep understanding check it out)
		const rotatedOffset = this.followOffset
			.clone()
			.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.facingAngle)

		// desired position - copy current position and add the rotated offset
		this._desiredPosition.copy(this.mesh.position).add(rotatedOffset)

		// Update camera position 
		// this.camera.instance.position.lerp(this._desiredPosition, 0.1) // basic solution. 
		// this.camera.instance.position.lerp(this._desiredPosition, this.followLerp * delta) // little better solution. 

		// Frame rate independent smoothing. 
		const posAlpha = 1 - Math.exp(-this.followLerp * delta)
		const lookAlpha = 1 - Math.exp(-this.lookAtLerp * delta)

		// move camera towards desired position
		this.camera.instance.position.lerp(this._desiredPosition, posAlpha)
		

		// smoothly track the point the camera looking at. 
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
