import Arrow from './../../../common/Arrow.js'
import CustomRect from './../../../custom/CustomRect.js'
import PixelColor from './../../canvas/PixelColor.js';

import ScannerAgent from './../items/ScannerAgent.js'


export default class CustomScanner{
//class for scanning a canvas pixel by pixel in different directions

	constructor(model){
		this.model=model;
		this.initParams();
		this.init();
		this.rect=new CustomRect();
		this.errors=[];
	}

	get canvas(){ return this.model.canvas; }

	initParams(){
		this.params={
			logging:{
				byGrid:true,
			},
			grid:{
				height:100,
				width:100,
			},
		};
	}

	addError(text){
		this.errors.push(text);
	}

	requireStatus(statusPath, methodName='', errorText=''){
		if(!this.model.getReadyStatus(statusPath)){
			if(!errorText){
				let className=this.constructor.name;
				errorText=`${className}.${methodName} requires status '${statusPath}'`;
			};
			this.addError(errorText);
			return false;
		}
		else
			return true;
	}

	init(){}


	forEachCell(rect, look=2, agent){
		this.rect.setRect(rect);
		//look is index of direction by Arrow
		if(typeof look == 'string')
			look = Arrow[look];
		if([2,3,4,5].indexOf(look)<0)
			throw (`look=${look} must be in range [2..5]`);

		let height = this.rect.height;
		let width = this.rect.width;
		let minSide = Math.min(height, width);
		let maxSide = Math.max(height, width);
		let step1 = Arrow.step(look);
		let step2 = Arrow.step(Arrow.incLook(look,2));

		let point0, point1, count1, count2, iter1, iter2;
		switch (look) {
			case 2:// -
				point0={x:rect.left, y:rect.top};
				count1=width;
				count2=height;
				break;
			case 3:// \
				point0={x:rect.right, y:rect.top};
				count1=1;
				count2=width+height-1;
				break;
			case 4:// |
				point0={x:rect.right, y:rect.top};
				count1=height;
				count2=width;
				break;
			case 5:// /
				point0={x:rect.right, y:rect.bottom};
				count1=1;
				count2=width+height-1;
				break;
			default:
				return;
		};

		point1 = {...point0};

		iter2=0;

		while(iter2<count2){
			let i=point1.y;
			let j=point1.x;

			agent.beforeCells(point1, count1);

			iter1=0;
			while(iter1<count1){
				let cell = this.model.getCell(i,j);
				agent.onCell(cell, iter1, {x:j, y:i});
				j+=step1.dx;
				i+=step1.dy;
				iter1++;
			}//iter1

			agent.afterCells(point1);

			//correcting row length
			if(look==3 || look==5){
				if(iter2<minSide)
					count1++;
				if(iter2>=maxSide)
					count1--;
			}

			point1.x+=step2.dx;
			point1.y+=step2.dy;
			//correcting of row begin
			switch (look) {
				case 3:
					if(iter2<width)
						point1.y--;
					else
						point1.x++;
					break;
				case 5:
					if(iter2<height)
						point1.x++;
					else
						point1.y++;
					break;
				default:
					break;
			}

			iter2++;
		}//iter2

	}

	gatherCellValues(rect, look=2, agent){
		if(!agent)
			agent = new ScannerAgent(this);
		this.forEachCell(rect, look, agent);
	}

//---

	getNeibCell(i,j,look){
		return this.model.getCell(i,j,look);
	}

	createLookData(cell,look,neibCell){
		return {};
	}

	onCellLooks(cell,func,startLook=0,finishLook=7){
		if(!cell)
			return;
		Arrow.forLooks(startLook,finishLook,((look)=>{
			let lookData = cell.aLookData[look];
			let neibCell = this.getNeibCell(cell.y, cell.x, look);
			if(!lookData){
				lookData = this.createLookData(cell,look,neibCell);
				cell.aLookData[look] = lookData;
			};
			func(cell,look,lookData,neibCell);
		}).bind(this));
	}

}
