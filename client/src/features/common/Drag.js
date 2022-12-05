
//from ScenarioEditor
const drag={

	drag:{tag:null,},
	startDrag:function(event, tag){
		this.drag.tag=tag;
		this.drag.dx= event.clientX - parseInt(this.drag.tag.state.left);
		this.drag.dy= event.clientY - parseInt(this.drag.tag.state.top );
		//console.log(tag);
		//console.log(this.drag.tag.style.left, this.drag.tag.style.top);
		//console.log('down', event.clientX, event.clientY);
	},

	doDrag:function(event){
		//console.log('move', this.drag);
		if(!this.drag.tag || event.buttons===0)return;
		this.drag.tag.setState({left: event.clientX - this.drag.dx});//+'px';
		this.drag.tag.setState({top : event.clientY - this.drag.dy});//+'px';
	},

	endDrag:function(){
		//console.log('up', this.drag);
		this.drag.tag=null;
	}

}


export default drag;
