import Arrow from './../../../common/Arrow.js'
import Angle from './../../../common/Angle.js'

import CustomScanner from './CustomScanner.js'
import ScannerAgent from './../items/ScannerAgent.js'
import ExtremumBlock from './../items/extremum/ExtremumBlock.js'


class ExtremumAgent extends ScannerAgent{

	setLook(look){
		this.look=look;
		this.index=0;
		this.area = this.block.areas[this.look];
	}

	beforeCells(point0, count1){
		super.beforeCells(point0, count1);
		this.list=this.area.lists[this.index]
		this.list.point0={...point0};
	}

	getValues(point1, values){
		this.list.point1=point1;
		this.list.setValues(values);
		this.index++;
	}

};

class ExtremumAgentL extends ExtremumAgent{

	init(){
		this.block=this.scanner.model.extrL;
	}

	getCellValue(cell){
		if(!cell)
			return -1;
		let value = cell.clrCoord.L;
		value = Math.round(value*255);//[0..1] -> [0..255]
		return value;
	}

};

class ExtremumAgentS extends ExtremumAgent{

	init(){
		this.block=this.scanner.model.extrS;
	}

	getCellValue(cell){
		if(!cell)
			return -1;
		let value = cell.clrCoord.S;
		value = Math.round(value*255);//[0..1] -> [0..255]
		return value;
	}

};

class ExtremumAgentH extends ExtremumAgent{

	init(){
		this.block=this.scanner.model.extrH;
	}

	getCellValue(cell){
		if(!cell)
			return -1;
		let value = cell.clrCoord.H;//[0..2*PI]
		value = Math.round(value/(Math.PI*2)*255);//[0..2*PI] -> [0..255]
		return value;
	}

};


class ExtremumFinder {

	get values(){return this.list.values}
	get ladder(){return this.list.ladder}
	get items(){return this.list.items}

	prepareLadder(){
		//wrap values to steps of one value
		let c=0;
		this.values.forEach((value, index)=>{
			if(!index || this.ladder[c-1].value!=value)
				c=this.ladder.push({start:index, count:1, value, kind:''});
			else
				this.ladder[c-1].count++;
		});
		//start goes from values beginning, not from left bound of canvas
	}

	findMinMax(){
		//ladder to mins & maxs
		let step = Arrow.step(this.list.look);

		let c=this.ladder.length;
		for(let i=0; i<c; i++){
			let last=(i>0)?this.ladder[i-1]:null;
			let curr=this.ladder[i];
			let next=(i<c-1)?this.ladder[i+1]:null;

			let last_value=last?last.value:-1;
			let next_value=next?next.value:-1;

			if(this.type=='H'){
				//for hue:
				if(last_value!=-1){
					if(last_value-curr.value>128)
						last_value-=255;
					else
						if(last_value-curr.value<-128)
							last_value+=255;
				};
				if(next_value!=-1){
					if(next_value-curr.value>128)
						next_value-=255;
					else
						if(next_value-curr.value<-128)
							next_value+=255;
				};
			};

			if((!last || last_value>curr.value) && (!next || curr.value<next_value)){
				let index2=curr.start+(curr.count-1)/2;
				let coords={
					x:this.list.point0.x+step.dx*index2,
					y:this.list.point0.y+step.dy*index2,
				};
				this.list.add(coords,'min', curr.value);
				curr.kind='min';//ladder
			}
			else
			if((!last || last_value<curr.value) && (!next || curr.value>next_value)){
				let index2=curr.start+(curr.count-1)/2;
				let coords={
					x:this.list.point0.x+step.dx*index2,
					y:this.list.point0.y+step.dy*index2,
				};
				this.list.add(coords,'max', curr.value);
				curr.kind='max';//ladder
			};

		};

	}


	findExtremums(list){
		this.list=list;
		this.type=list.area.block.type;
		this.prepareLadder();
		this.findMinMax();

		//console.log('this.list.items is ready!');
	}

};


export default class ExtremumScanner extends CustomScanner{

	fillBlock(block, agent, rect, looks){
		//pixels to block.areas.lists.values by agent
		block.init(rect, looks);//[2,3,4,5]
		looks.forEach(look=>{
			agent.setLook(look);
			agent.index=0;//for look=3 or =5: 0..width+height-1
			this.gatherCellValues(rect, look, agent);
		})
	}

	scanBrightness(rect, looks){
		if(!this.model.extrL)
			this.model.extrL= new ExtremumBlock(this.model, 'L');
		this.agentL = new ExtremumAgentL(this);
		this.fillBlock(this.model.extrL, this.agentL, rect, looks);
	}

	scanContrast(rect, looks){
		if(!this.model.extrS)
			this.model.extrS= new ExtremumBlock(this.model, 'S');
		this.agentS = new ExtremumAgentS(this);
		this.fillBlock(this.model.extrS, this.agentS, rect, looks);
	}

	scanHue(rect, looks){
		if(!this.model.extrH)
			this.model.extrH= new ExtremumBlock(this.model, 'H');
		this.agentH = new ExtremumAgentH(this);
		this.fillBlock(this.model.extrH, this.agentH, rect, looks);
	}

	scan(rect, params){
		if(params.L)
			this.scanBrightness(rect, params.L.looks);
		if(params.S)
			this.scanContrast(rect, params.S.looks);
		if(params.H)
			this.scanHue(rect, params.H.looks);

		//prepare mins & maxs
		this.finder = new ExtremumFinder();

		if(params.L)
			this.model.extrL.forEachList(params.L.looks, (list)=>{
				this.finder.findExtremums(list)
			});

		if(params.S)
			this.model.extrS.forEachList(params.S.looks, (list)=>{
				this.finder.findExtremums(list)
			});

		if(params.H)
			this.model.extrH.forEachList(params.H.looks, (list)=>{
				this.finder.findExtremums(list)
			});

	}

}
