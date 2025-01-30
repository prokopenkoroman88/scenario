import ItemPath from './../../../../common/ItemPath.js';

export default class FigurePath extends ItemPath {

	initConsts(){
		super.initConsts();
		this.PATH_SEPARATOR='.';// '/'
		this.DEFAULT_KIND='figure';//for FigureContainer
	}

	getIndex(container, link){//override
		return container.nameIndex(link.kind, link.name);
	}

	getItem(container, link){//override
		if(link.up)
			return container.ownFigure;
		else
			return container.byIndex(link.kind, link.index);
	}

	findItemIn_simple(container){
		for (let link of this.links) {
			container = container[link.kind](link.name);
			if(!container)
				return;
		}
		return container;
	}

}
