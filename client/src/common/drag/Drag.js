
//from ScenarioEditor
export default class Drag {

	constructor(){
		this.drag={tag:null,}
		//console.log('new Drag()', this.drag);
	}

	startDrag(event, tag){
		this.drag.tag=tag;
		let rect = this.drag.tag.state.rect;
		this.drag.dx= event.clientX - parseInt(rect.left);
		this.drag.dy= event.clientY - parseInt(rect.top );
		//console.log('startDrag', this.drag, this.drag.tag);
	}

	doDrag(event){
		//console.log('doDrag', this.drag, this.drag.tag);
		if(!this.drag.tag || event.buttons===0)return;
		let rect = this.drag.tag.state.rect;
		rect.left = event.clientX - this.drag.dx;
		rect.top = event.clientY - this.drag.dy;
		this.drag.tag.setState({rect});
	}

	endDrag(){
		//console.log('endDrag',  this.drag);
		this.drag.tag=null;
	}

	//custom configuration:
	onCaptionMouseDown(event, block){
		this.startDrag(event, block)
	}

	onCaptionMouseMove(event){
		//override
	}

	onCaptionMouseUp(event){
		//override
	}


	onBlockMouseDown(event, block){
		if(this.onBlockChoice)
			this.onBlockChoice(event, block);
	}

	onBlockMouseMove(event, block){
		//override
	}

	onBlockMouseUp(event, block){
		//override
	}


	onContainerMouseDown(event){
		//override
	}

	onContainerMouseMove(event){
		this.doDrag(event);
	}

	onContainerMouseUp(event){
		if(this.afterDrag)
			this.afterDrag(event, this.drag.tag);
		this.endDrag();
	}

}
