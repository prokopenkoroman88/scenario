
export default class ExtremumItem{

	constructor(owner, coords={x:0,y:0}, kind='plato', value){
		this.owner=owner;
		this.kind=kind;//['min', 'max', 'hill', 'plato']
		this.coords=coords;//center
		this.value=value;
	}

	get list(){return this.owner}

	//examples:
	//this.list.look
	//this.list.area.block.model.canvas

}
