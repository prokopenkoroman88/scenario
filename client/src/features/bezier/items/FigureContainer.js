import FigurePath from './FigurePath.js';

export default class FigureContainer{

	static arrName(attr){
		let arr = attr+'s';
		if(attr=='branch')
			arr = attr+'es';
		return arr;
	}

	get kind(){ return this.constructor.name.toLowerCase(); }//==attrName

	constructor(name=''){
		this.name=name;
	}

	nameIndex(attr, name){
		let arr = FigureContainer.arrName(attr);
		for(let i=0; i<this[arr].length; i++)
			if(this[arr][i].name===name)
				return i;
		return -1;
	}

	byIndex(attr, index){
		let arr = FigureContainer.arrName(attr);
		return this[arr][index];
	}

	byName(attr, name){
		let index=this.nameIndex(attr, name);
		return this.byIndex(attr, index);
	}

	byObject(item, getter){
		if(item.ownFigure)//&& item.ownFigure==this
			return item;
		if(getter)
			return getter(item);
	}

	getItems(attr, items, getter){
		items=items.map((item)=>{
			switch (typeof item) {
				case 'object': return this.byObject(item, getter);
				case 'number': return this.byIndex(attr, item);
				case 'string': return this.byName(attr, item);
			};
		},this);
		return items;
		//[point, 3, 'p1',] -> [point, point, point,]
	}

	pathIndices(path){
		let figurePath = new FigurePath(path);
		figurePath.findItemIn(this);
		return figurePath.links;
	}

	byPath(path){
		let figurePath = new FigurePath(path);
		let item = figurePath.findItemIn(this);
		//console.log('byPath', path, figurePath, item);
		return item;
	}

	namesIndices(attr, names){
		let container = this;
		let indices=[];
		for (let name of names) {
			if(!container)
				break;//return;
			let index=container.nameIndex(attr, name);
			indices.push(index);
			if(index<0)
				break;//return;
			container=container.byIndex(attr, index);
		};
		return indices;
	}

	byIndices(attr, indices){
		let container = this;

		if(indices && indices.length)
			for (let index of indices) {
				if(index<0 || !container)
					return;
				container=container.byIndex(attr, index);
			};

		return container;
	}

	byNames(attr, names){
		let indices=this.namesIndices(attr, names);
		//console.log('byNames',attr,names,indices);
		return this.byIndices(attr, indices);
	}

}
