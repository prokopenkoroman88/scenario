import Arrow from './../../../common/Arrow.js';
import ColorCoords from './../../canvas/ColorCoords.js';

export default class Cell{

	constructor(x,y,pixel=null){
		this.x=x;
		this.y=y;
		if(pixel){
			this.clrCoord = new ColorCoords(pixel);
		}
		this.aLookData = new Array(8);
	}

	data(look){
		if(typeof look == 'string')
			look = Arrow[look];//by world sides
		return this.aLookData[look%8];
	}

}
