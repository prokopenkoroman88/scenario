import Arrow from './../common/Arrow.js';

const MAX_COORD=10000;

export default class CustomRect{

	constructor(rect=null){
		if(rect)
			this.setRect(rect);
		else
			this.reset();
	}

	get width(){return this.right - this.left + 1}
	set width(value){ this.right = this.left + value - 1}

	get height(){return this.bottom - this.top + 1}
	set height(value){ this.bottom = this.top + value - 1}

	reset(){
		this.left=MAX_COORD;
		this.top=MAX_COORD;
		this.right=-MAX_COORD;
		this.bottom=-MAX_COORD;
	}

	setSides(left, top, right, bottom){
		this.left=left<right?left:right;
		this.top=top<bottom?top:bottom;
		this.right=left<right?right:left;
		this.bottom=top<bottom?bottom:top;
	}

	setByCorners(point0, point1){
		//point0 from mousedown, point1 from mouseup
		this.setSides(point0.x, point0.y, point1.x, point1.y);
	}

	setRect(rect){
		this.setSides(rect.left, rect.top, rect.right, rect.bottom);
	}

	stretch(value=1){//1 - expand, -1 - narrow
		this.left-=value;
		this.top-=value;
		this.right+=value;
		this.bottom+=value;
	}

	shift(dx,dy){
		this.left+=dx;
		this.top+=dy;
		this.right+=dx;
		this.bottom+=dy;
	}

	static pointPosition(point, rect){
		let xSect = Math.sign(point.x-rect.left) + Math.sign(point.x-rect.right);//[-2..2]
		let ySect = Math.sign(point.y-rect.top) + Math.sign(point.y-rect.bottom);//[-2..2]

		let zone=2;//out of borders
		if(xSect==0 && ySect==0)
			zone=0;//between borders
		else
			if(Math.abs(xSect)<=1 && Math.abs(ySect<=1))
				zone=1;//on borders

		let look = Arrow.pointSect[Math.sign(ySect)+1, Math.sign(xSect)+1];

		return {
			zone,//like radius
			look,//like angle
		};
	}

	pointPos(point){
		return CustomRect.pointPosition(point, this);
	}

	isOnBorder(point){
		return this.pointPos(point).zone==1;
	}

	isInRect(point){
	//	return (point.y>=this.top && point.x>=this.left && point.y<=this.bottom && point.x<=this.right);
		return this.pointPos(point).zone<=1;
	}

}
