import FigureItem from './FigureItem.js';

export default class Curve extends FigureItem{

	get array(){ return 'curves'; }

	init(){
		this.color='#fff';
		this.splines=[];
	}

	setRecord(value){
		super.setRecord(value);
		this.setFields(value, 'color');
	}

	getRecord(){
		let record=super.getRecord();
		this.getFields(record, 'color');
		return record;
	}

	linkItems(splines=[]){
		this.splines=this.getSplines(splines);
	}

	get splineIds(){
		return this.getIds('splines');
	}

	getSplines(splines){
		return this.ownFigure.getItems('spline', splines);
	}

	isNear(x,y){
		//
	}

};
