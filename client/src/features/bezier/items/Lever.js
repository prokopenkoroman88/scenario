import Angle from './../../../common/Angle.js';
import CustomPoint from './CustomPoint.js';

export default class Lever extends CustomPoint {

	get array(){ return 'levers'; }

	constructor(ownerFigure,x,y,rotor=null){
		super(ownerFigure,x,y);
		this.rotor = rotor;
		if(this.rotor)
			this.rotor.lever=this;
	}

	shift(dx,dy,bCascade=true){
		super.shift(dx,dy);
		if(!bCascade) return;
		if(this.rotor){
			let angle = Angle.angle(this.rotor, this);
			this.rotor.leverAngle = angle;
		};
	}

};
