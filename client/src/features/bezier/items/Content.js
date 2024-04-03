import FigureContainer from './FigureContainer.js';

export default class Content extends FigureContainer{

	constructor(){
		super();
		this.layers = [];
	}

	layer(name){
		return this.byName('layer', name);
	}

	indicesByPath(path, separator='.'){
		let found={};
		let names = path.split(separator);
		let i=0, iItem;
		iItem = this.nameIndex('layer', names[i]);
		found.layer = iItem;

		let container = this.layers[found.layer];
		found.figure = [];
		while (i<names.length) {
			i++;
			iItem = container.nameIndex('figure', names[i]);
			if(iItem>=0){
				found.figure.push(iItem);
				container = container.figures[iItem];//figure or subfigure
			}
			else
				break;
		};

		if(i<names.length){
			let res = container.indexByName(names[i]);
			found = {...found, ...res};
		};

		return found;
	}

	itemByIndices(found){
		let layer = this.layers[found.layer];
		if(!layer)
			return;
		let figure = layer;
		found.figure.forEach(index=>{
			if(index<0)
				return;
			figure = figure.figures[index];
		});
		if(!figure)
			return layer;

		const attrNames='point rotor lever node branch spline curve';
		const attrs=attrNames.split(' ');
		for (let attr of attrs) {
			let index = found[attr];
			if(index!==undefined && index>=0)
				return figure.byIndex(attr, index);
		};

		return figure;
	}

};
