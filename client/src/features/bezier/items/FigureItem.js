
export default class FigureItem{

	get array(){ return ''; }

	get index(){ return this.ownFigure[this.array].indexOf(this); }

	constructor(ownerFigure){
		this.ownFigure=ownerFigure;
	}

};
