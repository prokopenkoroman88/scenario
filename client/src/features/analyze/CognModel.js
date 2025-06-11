import Arrow from './../../common/Arrow.js';
import StatusTree from './../../common/StatusTree.js';

export default class CognModel{

	constructor(canvas){
		this.params={
			lookData:{
				half:false,
				start:0,
				finish:7,
			},
		};//need?
		this.status= new StatusTree();
		this.canvas=canvas;
		this.cells=null;
		this.extr=null;
		this.levels=[];
	}

	setReadyStatus(statusPath, value=true){
		this.status.setStatus(statusPath, value);
	}

	resetReadyStatus(statusPath=''){
		this.status.resetStatus(statusPath);
	}

	getReadyStatus(statusPath){
		return this.status.getStatus(statusPath);
	}

	get height(){ return this.canvas.height }

	get width(){ return this.canvas.width }

	initCells(){
		this.cells = new Array(this.height);//[height][width]
		for(let i=0; i<this.height; i++)
			this.cells[i] = new Array(this.width);
	}

	areCoordsInCanvas(i,j){
		return (i>=0 && j>=0 && i<this.height && j<this.width);
	}

	getCell(i,j,look=8){
		if(look!=8){
			let step=Arrow.step(look);
			i+=step.dy;
			j+=step.dx;
		};
		if(!this.areCoordsInCanvas(i,j)) return null;
		return this.cells[i][j];
	}

	setCell(i,j,cell){
		if(!this.areCoordsInCanvas(i,j)) return;
		this.cells[i][j]=cell;
	}

}
