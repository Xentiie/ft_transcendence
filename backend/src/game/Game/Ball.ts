import { Vec3 } from './Math'

export class	Ball
{
	position:		Vec3;
	speed:			Vec3;
	radius:			number;
	spin:			number;
	gameObject?:	any

	constructor(
		rad: number = 1,
		pos: Vec3 = Vec3.zero(),
		spd: Vec3 = new Vec3(1,0,0),
		spn: number = 0
	)
	{
		this.radius = rad;
		this.position = pos;
		this.speed = spd;
		this.spin = spn;
	}

	setRadius(rad: number)
	{
		this.radius = rad;
	}

	setSpin(spn: number)
	{
		this.spin = spn;
	}

	clone() {
		return new Ball(this.radius, this.position.clone(), this.speed.clone(), this.spin)
	}

};