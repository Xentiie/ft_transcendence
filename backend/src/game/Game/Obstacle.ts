import { Vec3 } from "./Math";

export class Obstacle {
	position: Vec3;
	direction: Vec3;
	radius: number;
	speed: number;
	gameObject?: any

	constructor(
		pos: Vec3 = Vec3.zero(),
		dir: Vec3 = Vec3.zero(),
		rad: number = 1,
		spd: number = 0
	) {
		this.position = pos;
		this.direction = dir;
		this.radius = rad;
		this.speed = spd;
	}

	setRadius(rad: number) {
		this.radius = rad;
	}

	setSpeed(spd: number) {
		this.speed = spd;
	}

	copy(other: Obstacle) {
		this.position = other.position.clone()
		this.direction = other.direction.clone()
		this.radius = other.radius
		this.speed = other.speed
	}

}