import ExtremumItem from './ExtremumItem.js'


export default class ExtremumList{

	constructor(owner, index){
		this.owner=owner;
		this.index=index;
		this.items=[];
	}

	get area(){return this.owner}

	get look(){return this.area.look}

	get rect(){
		let rect={
			left:Math.min(this.point0.x, this.point1.x),
			top:Math.min(this.point0.y, this.point1.y),
			right:Math.max(this.point0.x, this.point1.x),
			bottom:Math.max(this.point0.y, this.point1.y),
		};
		return rect;
	}

	newItem(coords, kind, value){
		return new ExtremumItem(this, coords, kind, value);
	}

	add(coords, kind, value){
		let extremum = this.newItem(coords, kind, value);
		this.items.push(extremum);
		return extremum;
	}

	setValues(values){
		this.values=values;
		this.ladder=[];
		this.items=[];
	}

}
