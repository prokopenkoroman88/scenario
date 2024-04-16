
export default class ItemPath {

	constructor(path=''){
		this.initConsts();
		this.path=path;
	}

	initConsts(){
		this.PATH_SEPARATOR='/';
		this.KEY_SEPARATOR=':';
		this.DEFAULT_KIND='';
		this.UP_NAME='..';
	}

	#path='';

	set path(value){
		this.#path=value;
		this.links=this.pathToLinks(value);
	}

	get path(){ return this.#path }

	pathToLinks(path=''){
		let aSteps = path.split(this.PATH_SEPARATOR);

		let aLinks = aSteps.map((step)=>{
			let aWords = step.split(this.KEY_SEPARATOR);
			let link;
			switch (aWords.length) {
				case 0:
					break;
				case 1:
					link={
						kind:this.DEFAULT_KIND,
						name:aWords[0],
					};
					break;
				case 2:
					link={
						kind:aWords[0],
						name:aWords[1],
					};
					break;
				default:
					break;
			};
			if(link.name==this.UP_NAME)
				link.up=true;
			else
				link.index=-1;
			return link;
		});
		return aLinks;

	}

	getIndex(container, link){
		return -1;//must be override
	}

	getItem(container, link){
		return;//must be override
	}

	findItemIn(container){
		if(!this.links || !this.links.length)
			return;
		for (let link of this.links) {
			if(!link.up){
				link.index = this.getIndex(container, link);
				if(link.index<0)
					return;
			};
			link.item = this.getItem(container, link);
			container = link.item;
		};
		return container;
	}

}
