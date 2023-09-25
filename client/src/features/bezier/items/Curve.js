import FigureItem from './FigureItem.js';

export default class Curve extends FigureItem{

	get array(){ return 'curves'; }

	constructor(ownerFigure, splines=[]){
		super(ownerFigure);
		this.splines=splines;
		
	}

	get splineIds(){
		return this.getIds('splines');
	}

	isNear(x,y){
		//
	}

};
