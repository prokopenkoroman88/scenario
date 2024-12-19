import Angle from './../../../common/Angle.js';
import Rect from './Rect.js';
import FigureItem from './FigureItem.js';

export default class Spline extends FigureItem{

	get array(){ return 'splines'; }

	init(){
		this.points=[];
	}

	linkItems(points){
		this.points=this.getPoints(points);//point0,point1
		this.prepare();
	}

	getPoints(points){
		return this.ownFigure.getItems('point', points);
	}

	prepareRect(){
		this.rect.prepare(this.points);
	}

	prepare(){
		if(!this.rect)
			this.rect = new Rect();
		this.prepareRect();
		this.prepareInterimBezierPoints();
	}

	prepareInterimBezierPoints(){
		//масив проміжних точок для пошуку в isNear
		let newPoint=this.points[0];
		let c=0;
		for(let i=1; i<this.points.length; i++)
			c+=Angle.dist2D(this.points[i-1], this.points[i]);
		c=c/5;//4
		let res=[];
		res.push({x:newPoint.x, y:newPoint.y});//first control point
		for(let i=1; i<=c; i++){
			newPoint = Spline.findInterimBezierPoint(this.points, i/c);
			//newPoint.round();
			newPoint.x = Math.round(newPoint.x);
			newPoint.y = Math.round(newPoint.y);
			res.push(newPoint);
		};
		newPoint=this.points[this.points.length-1];
		res.push({x:newPoint.x, y:newPoint.y});//last control point
		this.interimBezierPoints=res;
		return res;
	}

	static findInterimPoint(dot1,dot2,coef){
		return {
			x: dot1.x + (dot2.x-dot1.x)*coef,
			y: dot1.y + (dot2.y-dot1.y)*coef,
		};
	}

	static findInterimBezierPoint(aDot, coef){//interim point
/*
		let aPnt=[{}, {},{}, {},{},{}, {},{},{},{}];
		aPnt[9]=aDot[3];
		aPnt[8]=aDot[2];
		aPnt[7]=aDot[1];
		aPnt[6]=aDot[0];

		aPnt[5]=middle(aPnt[8], aPnt[9], coef);
		aPnt[4]=middle(aPnt[7], aPnt[8], coef);
		aPnt[3]=middle(aPnt[6], aPnt[7], coef);

		aPnt[2]=middle(aPnt[4], aPnt[5], coef);
		aPnt[1]=middle(aPnt[3], aPnt[4], coef);

		aPnt[0]=middle(aPnt[1], aPnt[2], coef);
//wrapped code:*/
		let n=aDot.length;
		let i2=(n*n+n)/2;//10 6 3 1
		let i1=i2-n;//6 3 1 0
		let aPnt = new Array(i2);
		for(let i=0; i<n; i++)
			aPnt[i1+i]=aDot[i];
		for(let lvl=n-1; lvl>0; lvl--){//степень
			for(let j=lvl; j>0; j--){//точки
				i1--;
				aPnt[i1]=Spline.findInterimPoint(aPnt[i1+lvl], aPnt[i1+lvl+1], coef);
			};
		};

		return aPnt[0];
	}

	get pointIds(){
		return this.getIds('points');
	}

	get controlPoint(){
		return [this.points[0], this.points[this.points.length-1]];
	}

	get leverPoint(){
		let arr=[];
		for(let i=1; i<this.points.length-1; i++)
			arr.push(this.points[i]);
		return arr;
	}

	get curves(){
		//find curves of spline:
		return this.getOwners('curves');
	}

	isNear(x,y){
		if(!this.rect.inRect(x,y))
			return false;
		let points = this.interimBezierPoints;
		for(let i=0; i<points.length; i++)
			if(Angle.dist2D(points[i], {x, y})<5)
				return true;
		return false;
	}

};
