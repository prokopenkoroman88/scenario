import Angle from './../../../common/Angle.js';
import CustomPoint from './CustomPoint.js';

const LEVER_RADIUS=40;

export default class Rotor extends CustomPoint {

	get array(){ return 'rotors'; }

	constructor(ownerFigure,x,y,angle=0){
		super(ownerFigure,x,y);
		this.mainAngle = 0;//кут, отриманий від конфігурації старших роторів, за ним знаходитья lever, коли angle = 0
		this.angle = angle;//власний кут
		this.points = [];
		this.nodes = [];
		this.rotors = [];
	}

	shift(dx,dy,bCascade=true){
		super.shift(dx,dy);
		if(!bCascade) return;
		this.points.forEach(point=>point.shift(dx,dy));
		this.nodes.forEach(node=>node.shift(dx,dy));
		this.rotors.forEach(rotor=>rotor.shift(dx,dy,bCascade));
	}

	preparePoints(rotor, dangle){
		if(dangle==0) return;
		//rotor == this || this.rotors[]
		const center = this;
		rotor.points.forEach(point=>point.rotate(center, dangle));
		rotor.nodes.forEach(node=>node.rotate(center, dangle));
		rotor.rotors.forEach(rotor=>rotor.rotate(center, dangle));
		rotor.rotors.forEach(rotor=>rotor.lever.rotate(center, dangle));
		let branches = rotor.ownFigure.branches;
		branches.forEach(branch=>branch.prepare());
		let splines = rotor.ownFigure.splines;
		splines.forEach(spline=>spline.prepare());
	}

	rotateAround(rotor=null, dangle=0){
		if(dangle==0)
			return;
		const center = this;
		if(!rotor)
			rotor=this;
		if(rotor!=this)
			rotor.mainAngle+=dangle;//Змінюється для підлеглих роторів

		this.preparePoints(rotor, dangle);

		rotor.rotors.forEach(rotor=>this.rotateAround(rotor, dangle));
	}

	get leverPoint(){
		if(this.lever)
			return this.lever;

		for(let lever in this.ownFigure.levers)
			if(lever.rotor==this){
				this.lever=lever;
				return lever;
			};

		let lever = {x:this.x, y:this.y-LEVER_RADIUS};
		Angle.rotate2D(this, lever, this.leverAngle);
		return lever;
	}

	get pointIds(){
		return this.getIds('points');
	}

	get nodeIds(){
		return this.getIds('nodes');
	}

	get rotorIds(){
		return this.getIds('rotors');
	}

	changeAngle(dangle){
		if(dangle==0)
			return;
		this.rotateAround(this, dangle);
		this.angle+=dangle;
		this.ownFigure.round();
	}

	setAngle(angle){
		let dangle=Angle.diff(this.angle, angle);
		if(dangle==0)
			return;
		this.changeAngle(dangle);
	}

	set leverAngle(angle){
		this.setAngle(angle - this.mainAngle);
	}

	get leverAngle(){
		return this.mainAngle + this.angle;
	}

};
