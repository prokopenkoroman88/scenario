import Angle from './../../../../common/Angle.js';
import FigureItem from './FigureItem.js';

export default class CustomPoint extends FigureItem{

	init(){
		this.x=0;
		this.y=0;
	}

	setRecord(value){
		super.setRecord(value);
		this.setFields(value, 'x y');
	}

	getRecord(){
		let record=super.getRecord();
		this.round(1);
		this.getFields(record, 'x y');
		return record;
	}

	shift(dx,dy){
		this.x+=dx;
		this.y+=dy
	}

	distance(x,y){
		return Angle.dist2D(this, {x,y});
	}

	isNear(x,y,CURSOR_RADIUS=0){
		return (this.distance(x,y)<CURSOR_RADIUS);
	}

	grow(center, dw, dh){
		if(!center)
			center=this.ownFigure.center;
		this.x = Angle.grow(center.x, this.x, dw);
		this.y = Angle.grow(center.y, this.y, dh);
	}

	rotate(center,angle=0){
		if(!center)
			center=this.ownFigure.center;
		Angle.rotate2D(center, this,angle);
	}

	round(fractionDigits=0){
		this.x = +(this.x).toFixed(fractionDigits);
		this.y = +(this.y).toFixed(fractionDigits);
	}

};
