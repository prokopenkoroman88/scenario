import Angle from './../../../../common/Angle.js';


export default class Segment{
// Segment - відрізок сплайну, обмежений точками dot1 і dot2
// На canvas відображається у вигляді овалу (два півкола та з'єднувальні лінії)
// (діаметри точок можуть відрізнятись)

	constructor(oldDot, newDot){

		this.delta={
			y : Math.sign((newDot.y-oldDot.y).toFixed(0)),
			x : Math.sign((newDot.x-oldDot.x).toFixed(0)),
		};
		if(this.delta.y<0 || (this.delta.y==0 && this.delta.x<0)){
			this.dot1=newDot;
			this.dot2=oldDot;
		}
		if(this.delta.y>0 || (this.delta.y==0 && this.delta.x>0)){
			this.dot1=oldDot;
			this.dot2=newDot;
		}


		if(!this.dot1 || !this.dot2)
			return;
		let angle = this.angle;

		//крайні точки цього сегмента
		this.dot1Before=Angle.newDot(this.dot1, {angle: angle-Math.PI/2, dist: this.dot1.width/2});//Radial
		this.dot1After =Angle.newDot(this.dot1, {angle: angle+Math.PI/2, dist: this.dot1.width/2});//Radial
		this.dot2Before=Angle.newDot(this.dot2, {angle: angle-Math.PI/2, dist: this.dot2.width/2});//Radial
		this.dot2After =Angle.newDot(this.dot2, {angle: angle+Math.PI/2, dist: this.dot2.width/2});//Radial


		let dot1Top   ={x:this.dot1.x, y:this.dot1.y-this.dot1.width/2};
		let dot1Bottom={x:this.dot1.x, y:this.dot1.y+this.dot1.width/2};
		let dot2Top   ={x:this.dot2.x, y:this.dot2.y-this.dot2.width/2};
		let dot2Bottom={x:this.dot2.x, y:this.dot2.y+this.dot2.width/2};

		if(dot1Top.y<dot2Top.y)
			this.top=dot1Top
		else
			this.top=dot2Top;

		if(dot1Bottom.y>dot2Bottom.y)
			this.bottom=dot1Bottom
		else
			this.bottom=dot2Bottom;


		this.width_x = 1;//замість calcWidth
	}


	get angle(){ return Angle.angle(this.dot1, this.dot2); }
	get dx(){ return this.dot2.x-this.dot1.x; }
	get dy(){ return this.dot2.y-this.dot1.y; }

	vert_narrow(){
		//from left to right
		let dx=this.dx;
		let dy=this.dy;
		if(!dx)
			return 0;//dx=1;
		return (dy) / (dx);
	}


	inRect(rect){
		return (this.dot1.y>=rect.top && this.dot2.y>=rect.top && this.dot1.y<=rect.bottom && this.dot2.y<=rect.bottom)
	}


	calcX(y){
		let coeff=0.5;
		if( Math.round(this.dot1.y)!=Math.round(this.dot2.y) )
			coeff = (y-this.dot1.y)/ (this.dot2.y-this.dot1.y);
		if(coeff<0 || coeff>1)
			return undefined;//out of line: dot1 - dot2
		return this.dot1.x + (this.dot2.x-this.dot1.x) * coeff;
	}

	calcXbyDot(y, dot, side=-1){
		let x = dot.x + side*Math.pow(  Math.pow(dot.width/2, 2) - Math.pow(y-dot.y, 2),  0.5);
		//  x*x + y*y = w/2
		return x;
	}

	calcXbyLine(y, side=-1){//both After, or both Before
		let dot1,dot2;
		if(side<0){//left
			dot1=this.dot1After;
			dot2=this.dot2After;
		}
		else{
			dot1=this.dot1Before;
			dot2=this.dot2Before;
		};
		let coeff = ((y-dot1.y)/(dot2.y-dot1.y));
		let x = Angle.grow(dot1.x, dot2.x, coeff);
		return x;
	}

	calcLeftX(y){
		let dot1=this.dot1;
		let dot2=this.dot2;
		let x=NaN;

		if(y>=(dot1.y-dot1.width/2) && y<=(this.dot1After.y))
			x = this.calcXbyDot(y, dot1, -1);
		else
		if(y>=(this.dot2After.y) && y<=(dot2.y+dot2.width/2))
			x = this.calcXbyDot(y, dot2, -1);
		else
		if(y>=this.dot1After.y && y<=this.dot2After.y)
			x = this.calcXbyLine(y, -1);
		else
		if(y<=this.dot1Before.y && y>=this.dot2Before.y)//коли dot2 менше та зліва
			x = this.calcXbyLine(y, 1);
		return x;
	}

	calcRightX(y){
		let dot1=this.dot1;
		let dot2=this.dot2;
		let x=NaN;

		if(y>=(dot1.y-dot1.width/2) && y<=(this.dot1Before.y))
			x = this.calcXbyDot(y, dot1, 1);
		else
		if(y>=(this.dot2Before.y) && y<=(dot2.y+dot2.width/2))
			x = this.calcXbyDot(y, dot2, 1);
		else
		if(y>=this.dot1Before.y && y<=this.dot2Before.y)
			x = this.calcXbyLine(y, 1);
		else
		if(y<=this.dot1After.y && y>=this.dot2After.y)//коли dot2 менше та в центрі
			x = this.calcXbyLine(y, -1);
		return x;
	}


	newLink(iSide){
		return new SegmentLink(this, iSide);
	}


	newCross(y){
		return new SegmentCross(this, y);
	}

}


class SegmentLink{

	constructor(segment, iSide){
		this.segment = segment;//line:{dot1, dot2}

		switch (iSide) {
			case 0:
				this.x = this.segment.dot1.x;
				this.y = this.segment.dot1.y;
				if(this.segment.delta.y==0)
					this.left=true;
				else
					this.top=true;
				break;
			case 1:
				this.x = this.segment.dot2.x;
				this.y = this.segment.dot2.y;
				if(this.segment.delta.y==0)
					this.right=true;
				else
					this.bottom=true;
				break;
			default:
				break;
		};

	}

}


class SegmentCross{

	constructor(segment,y){
		this.segment=segment;

		this.sp=segment.spline.index;
		this.x1=segment.dot1.x;
		this.y1=segment.dot1.y;
		this.x2=segment.dot2.x;
		this.y2=segment.dot2.y;

		this.left_x=segment.calcLeftX(y);
		this.right_x=segment.calcRightX(y);
		this.x=(this.left_x+this.right_x)/2;
		//this.curve=;
	}

}
