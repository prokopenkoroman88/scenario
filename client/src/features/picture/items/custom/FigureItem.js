
export default class FigureItem{

	get kind(){ return this.constructor.name.toLowerCase(); }//==attrName

	get array(){ return ''; }

	get index(){ return this.ownFigure[this.array].indexOf(this); }

	constructor(ownerFigure, record){
		this.ownFigure=ownerFigure;
		if(this.init)
			this.init();
		if(record)
			this.record=record;
	}

	setFields(record, fieldNames){
		fieldNames.split(' ').forEach(field=>{
			if(record[field]!==undefined)
				this[field]=record[field]
		})
	}

	getFields(record, fieldNames){
		fieldNames.split(' ').forEach(field=>{
			if(this[field]!==undefined)
				record[field]=this[field]
		})
	}

	set record(value){this.setRecord(value)}

	setRecord(value){
		this.setFields(value, 'id name');
	}

	get record(){return this.getRecord()}

	getRecord(){
		let record={};
		this.getFields(record, 'id name');
		return record;
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
