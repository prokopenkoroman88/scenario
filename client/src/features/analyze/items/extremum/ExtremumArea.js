import ExtremumList from './ExtremumList.js'


export default class ExtremumArea{

	constructor(owner, look){
		this.owner=owner;
		this.look=look;//orientation index
		this.lists=[];//rows or cols or diagonals
	}

	get block(){return this.owner}

	newList(i){
		return new ExtremumList(this, i)
	}

	init(size){
		this.lists=Array(size);
		for(let i=0; i<size; i++)
			this.lists[i] = this.newList(i);
	}

}
