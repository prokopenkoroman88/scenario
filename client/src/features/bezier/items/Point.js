import CustomPoint from './CustomPoint.js';

export default class Point extends CustomPoint{

	get array(){ return 'points'; }

	constructor(ownerFigure,x,y,width=1,color='#000'){
		super(ownerFigure,x,y);
		this.width = width;
		this.color = color;
	}

	get splines(){
		//find splines of point:
		return this.getOwners('splines');
	}
};
