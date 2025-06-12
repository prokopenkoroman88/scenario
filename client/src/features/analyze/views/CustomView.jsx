
export default class CustomView {

	constructor(owner){
		this.owner=owner;
		this.init();
	}

	get model(){return this.owner}

	init(){}

}
