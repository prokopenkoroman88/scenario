
export default class Angle{
	static dist2D(d1,d2){
		return Math.sqrt( Math.pow(d1.x-d2.x,2) + Math.pow(d1.y-d2.y,2) );
	}
	static dist3D(d1,d2){
		return Math.sqrt( Math.pow(d1.x-d2.x,2) + Math.pow(d1.y-d2.y,2) + Math.pow(d1.z-d2.z,2) );
	}
	static angle(d1,d2){
		return Math.atan2(d2.y-d1.y, d2.x-d1.x);
	}
	static grow(value1,value2,coeff){
		return value1 + (value2-value1)*coeff;
	}
	static rotate2D(d1,d2,delta){
		let dist = Angle.dist2D(d1,d2);
		let angle = Angle.angle(d1,d2);
		angle+=delta;
		d2.y = d1.y+Math.sin(angle)*dist;
		d2.x = d1.x+Math.cos(angle)*dist;
	}
}
