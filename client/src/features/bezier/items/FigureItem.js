
export default class FigureItem{

	get array(){ return ''; }

	get index(){ return this.ownFigure[this.array].indexOf(this); }

	constructor(ownerFigure){
		this.ownFigure=ownerFigure;
	}

	getIds(arrName){
		//Індекси дочірніх елементів даного елемента у фігурі
		let ids = this[arrName].map(item=>{
			if(item)
				return item.index
		});
		return ids;
	}

	getOwners(arrName){
		//Елементи, що посилаються на даний елемент, який для них дочірній
		let item_owners=[];
		let item=this;
		this.ownFigure[arrName].forEach(owner=>{
			if(owner[item.array].indexOf(item)>=0)
				item_owners.push(owner);
		});
		return item_owners;
	}

};
