import CommonEditor from './../common/editor/CommonEditor.jsx';
import Drag from './../common/drag/Drag.js';


export default class CustomEditor {

	constructor(owner=null){
		this.owner=owner;
		this.mainMenu=[];
		this.topButtons=[];
		this.leftButtons=[];
		this.rightButtons=[];
		this.drag=new Drag();//?
		this.init();
	}

	init(){
		this.caption='Custom editor';
		this.params={
			'left-panel-width':'0px',
			'right-panel-width':'0px',
		};
	}

	setComponent(component){
		this.component=component;
		console.log('setComponent', this.caption, this.component);
	}

	getCSS(){
		let css={
			className:'editor',
			styles:{
				'--left-panel-width':this.params['left-panel-width'],
				'--right-panel-width':this.params['right-panel-width'],
			},
			level:1,
		};
		return css;
	}

	renderMain(){
		return null;
	}

	getTopButtons(){return []}
	getLeftButtons(){return []}
	getRightButtons(){return []}

	beforeRender(){
		this.topButtons=this.getTopButtons();
		this.leftButtons=this.getLeftButtons();
		this.rightButtons=this.getRightButtons();
	}

	render(index=0){
		return (
			<CommonEditor
				key={index}
				editor={this}
				caption={this.caption}
			/>
		)
	}

}
