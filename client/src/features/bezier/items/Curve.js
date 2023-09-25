import FigureItem from './FigureItem.js';

export default class Curve extends FigureItem{

	get array(){ return 'curves'; }

	constructor(ownerFigure, splines=[]){
		super(ownerFigure);
		this.splines=splines;
		
	}

	get splineIds(){
		let ids = this.splines.map((spline)=>{
			return this.ownFigure.splines.indexOf(spline);
		},this);
		return ids;
	}

	isNear(x,y){
		//
	}

};
