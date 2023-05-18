
//from ScenarioEditor
const drag={

	drag:{tag:null,},
	startDrag:function(event, tag){
		this.drag.tag=tag;
		let rect = this.drag.tag.state.rect;
		this.drag.dx= event.clientX - parseInt(rect.left);
		this.drag.dy= event.clientY - parseInt(rect.top );
	},

	doDrag:function(event){
		if(!this.drag.tag || event.buttons===0)return;
		let rect = this.drag.tag.state.rect;
		rect.left = event.clientX - this.drag.dx;
		rect.top = event.clientY - this.drag.dy;
		this.drag.tag.setState({rect});
	},

	endDrag:function(){
		this.drag.tag=null;
	}

}


export default drag;
