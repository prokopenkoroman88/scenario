import CustomScanner from './CustomScanner.js'
import ScannerAgent from './../items/ScannerAgent.js'
import Cell from './../items/Cell.js';


class CreatingAgent extends ScannerAgent{

	onCell(cell, iter1, point){
		let i=point.y;
		let j=point.x;
		if(!cell){
			cell = this.scanner.createCell(j,i);
			this.scanner.model.setCell(i,j,cell);
		};
	}

};


export default class FirstScanner extends CustomScanner{

	createCell(x,y){
		let pixel = this.canvas.getPixel(x,y);
		return new Cell(x,y,pixel);
	}

	scan(rect=null){
		if(!rect)
			rect={
				left:0,
				top:0,
				right:this.model.width-1,
				bottom:this.model.height-1,
			};

		this.agent = new CreatingAgent(this);

		if(!this.model.cells)
			this.model.initCells();

		let look=2;
		this.gatherCellValues(rect, look, this.agent);

	}

}
