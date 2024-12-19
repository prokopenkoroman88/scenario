import CustomPoint from './CustomPoint.js';

export default class Point extends CustomPoint{

	get array(){ return 'points'; }

	init(){
		super.init();
		this.width = 1;
		this.color = '#000';
	}

	setRecord(value){
		super.setRecord(value);
		this.setFields(value, 'width color');
	}

	getRecord(){
		let record=super.getRecord();
		this.getFields(record, 'width color');
		return record;
	}

	get splines(){
		//find splines of point:
		return this.getOwners('splines');
	}
};
