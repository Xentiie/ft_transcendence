export class Vec2 {
	x: number;
	y: number;

	static zero() { return new Vec2(0, 0) }
	static one() { return new Vec2(1, 1) }

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	set(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	clamp(min: number, max: number) {
		this.x = clamp(this.x, min, max)
		this.y = clamp(this.y, min, max)
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
	}

	clone() {
		return new Vec2(this.x, this.y)
	}

};

export class Vec3 {
	x: number;
	y: number;
	z: number;

	static zero() { return new Vec3(0, 0, 0) }
	static one() { return new Vec3(1, 1, 1) }

	constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	clamp(min: number, max: number) {
		this.x = clamp(this.x, min, max)
		this.y = clamp(this.y, min, max)
		this.z = clamp(this.z, min, max)
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
	}

	clone() {
		return new Vec3(this.x, this.y, this.z)
	}

};

export class Mat3 {
	j0: Vec3;
	j1: Vec3;
	j2: Vec3;
	det: number;

	constructor(v0: Vec3, v1: Vec3, v2: Vec3) {
		this.j0 = v0;
		this.j1 = v1;
		this.j2 = v2;
		this.det = (
			this.j0.x * (this.j1.y * this.j2.z - this.j1.z * this.j2.y) -
			this.j0.y * (this.j1.x * this.j2.z - this.j1.z * this.j2.x) +
			this.j0.z * (this.j1.x * this.j2.y - this.j1.y * this.j2.x)
		);
	}

	xV(v: Vec3) {
		return (
			new Vec3(
				this.j0.x * v.x + this.j1.x * v.y + this.j2.x * v.z,
				this.j0.y * v.x + this.j1.y * v.y + this.j2.y * v.z,
				this.j0.z * v.x + this.j1.z * v.y + this.j2.z * v.z
			)
		);
	}

	xM(m: Mat3) {
		return (
			new Mat3(
				this.xV(m.j0),
				this.xV(m.j1),
				this.xV(m.j2)
			)
		);
	}

	inv() {
		if (!this.det)
			return (undefined);
		return (
			new Mat3(
				new Vec3(
					(this.j1.y * this.j2.z - this.j1.z * this.j2.y) / this.det,
					(this.j0.z * this.j2.y - this.j0.y * this.j2.z) / this.det,
					(this.j0.y * this.j1.z - this.j0.z * this.j1.y) / this.det
				),
				new Vec3(
					(this.j1.z * this.j2.x - this.j1.x * this.j2.z) / this.det,
					(this.j0.x * this.j2.z - this.j0.z * this.j2.x) / this.det,
					(this.j0.z * this.j1.x - this.j0.x * this.j1.z) / this.det
				),
				new Vec3(
					(this.j1.x * this.j2.y - this.j1.y * this.j2.x) / this.det,
					(this.j0.y * this.j2.x - this.j0.x * this.j2.y) / this.det,
					(this.j0.x * this.j1.y - this.j0.y * this.j1.x) / this.det
				)
			)
		);
	}
}

export function scalaire(a: Vec3, b: Vec3) {
	return (a.x * b.x + a.y * b.y + a.z * b.z);
}

export function norm(a: Vec3) {
	return (Math.sqrt(scalaire(a, a)));
}

export function distance(a: Vec3, b: Vec3) {
	return (norm(new Vec3(a.x - b.x, a.y - b.y, a.z - b.z)));
}

export function rotz(vec: Vec3, theta: number) {
	const m = new Mat3(
		new Vec3(Math.cos(theta), Math.sin(theta), 0),
		new Vec3(-Math.sin(theta), Math.cos(theta), 0),
		new Vec3(0, 0, 1)
	);
	return (m.xV(vec));
}

export function rotx(vec: Vec3, theta: number) {
	const m = new Mat3(
		new Vec3(1, 0, 0),
		new Vec3(0, Math.cos(theta), Math.sin(theta)),
		new Vec3(0, -Math.sin(theta), Math.cos(theta))
	);
	return (m.xV(vec));
}

export function clamp(v: number, min: number, max: number) {
	return Math.max(Math.min(v, max), min)
}



