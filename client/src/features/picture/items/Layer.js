import FigureContainer from './custom/FigureContainer.js';

export default class Layer extends FigureContainer{

	constructor(name=''){
		super(name);
		this.figures = [];//Figure (and imported)
	}

	figure(name){
		return this.byName('figure', name);
	}

};
