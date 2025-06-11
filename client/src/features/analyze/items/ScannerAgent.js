export default class ScannerAgent{

	constructor(scanner){
		this.scanner=scanner;//owner
		this.init();
	}

	init(){
		//before scanning
	}

	beforeCells(point0, count1){
		//before every row|col|diagonal
		this.values = new Array(count1);
	}

	getCellValue(cell){
		//need override
	}

	onCell(cell, iter1, point={x:0, y:0}){
		this.value = this.getCellValue(cell);
		this.values[iter1] = this.value;
	}

	getValues(point1, values){
		//need override
	}

	afterCells(point1){
		//after every row|col|diagonal
		this.getValues(point1, this.values);
	}

}
