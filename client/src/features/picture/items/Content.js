import FigureContainer from './custom/FigureContainer.js';

export default class Content extends FigureContainer{

	constructor(){
		super();
		this.layers = [];
	}

	layer(name){
		return this.byName('layer', name);
	}

};
