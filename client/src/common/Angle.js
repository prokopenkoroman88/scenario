
export default class Angle{

	static dist2D(d1,d2){
		return Math.sqrt( Math.pow(d1.x-d2.x,2) + Math.pow(d1.y-d2.y,2) );
	}

	static dist3D(d1,d2){
		return Math.sqrt( Math.pow(d1.x-d2.x,2) + Math.pow(d1.y-d2.y,2) + Math.pow(d1.z-d2.z,2) );
	}

	static normalize(angle){
		if(angle<-Math.PI)
			angle+=(Math.PI*2);
		if(angle>Math.PI)
			angle-=(Math.PI*2);
		return angle;//[-PI..Pi]
	}

	static angle(d1,d2){
		let angle = Math.atan2(d2.y-d1.y, d2.x-d1.x);
		angle = Angle.normalize(angle+Math.PI/2);
		//-PIrad = 6:00, -PI/2rad = 9:00, 0rad = 12:00, PI/2rad = 3:00, PIrad = 6:00
		return angle;
	}

	static diff(angle1, angle2){//angle difference
		angle2 = Angle.normalize(angle2);
		angle1 = Angle.normalize(angle1);
		let angle = Angle.normalize(angle2 - angle1);
		return angle;
	}

	static add(angle, dangle){
		angle = Angle.normalize(angle);
		dangle = Angle.normalize(dangle);
		return Angle.normalize(angle + dangle);
	}

	static grow(value1,value2,coeff){
		return value1 + (value2-value1)*coeff;
	}

	static calcOffset(d1,d2){
		return {
			dx: d2.x-d1.x,
			dy: d2.y-d1.y,
		}
	}

	static moveOffset(d1, d2, coords={dx:0, dy:0}){
		d2.x = d1.x+coords.dx;
		d2.y = d1.y+coords.dy;
	}

	static calcRadial(d1,d2){
		return {
			dist : Angle.dist2D(d1,d2),
			angle : Angle.angle(d1,d2),
		}
	}

	static moveRadial(d1, d2, coords={angle:0, dist:0}){
		d2.x = d1.x+Math.sin(coords.angle)*coords.dist;//+cos
		d2.y = d1.y-Math.cos(coords.angle)*coords.dist;//+sin
	}

	static move(d1, d2, coords={}){
		if(coords.dx || coords.dy)
			Angle.moveOffset(d1, d2, coords);
		else
		if(coords.dist || coords.angle)
			Angle.moveRadial(d1, d2, coords);
	}

	static copyDot(d1){
		return {x:d1.x, y:d1.y};
	}

	static newDot(d1, coords={}){
		let d2 = Angle.copyDot(d1);
		Angle.move(d1,d2, coords);
		return d2;
	}

	static rotate2D(d1,d2,delta){
		let coords = Angle.calcRadial(d1,d2);
		coords.angle+=delta;
		Angle.moveRadial(d1, d2, coords);
	}
}
