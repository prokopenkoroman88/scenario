import ExtremumArea from './ExtremumArea.js'


export default class ExtremumBlock{

	constructor(owner, type){
		this.owner=owner;//model
		this.type=type;//'S', 'L', 'H'
		this.areas=Array(8);
		for(let look=2; look<=5; look++)
			this.areas[look] = this.newArea(look);
	}

	get model(){return this.owner}

	newArea(look){
		return new ExtremumArea(this, look);
	}

	init(rect, looks=[2,3,4,5]){
		this.rect=rect;//offset
		let height=rect.bottom-rect.top+1;
		let width=rect.right-rect.left+1;
		const sizes=[0, 0, height, height+width-1, width, height+width-1, 0, 0];
		looks.forEach(look=>{
			this.areas[look].init( sizes[look] );
		});
	}

	forEachList(looks=[2,3,4,5], func){
		looks.forEach(look=>{
			let area=this.areas[look]
			if(!area ||!area.lists.length)
				return;
			area.lists.forEach(list=>func(list));
		})
	}

}
