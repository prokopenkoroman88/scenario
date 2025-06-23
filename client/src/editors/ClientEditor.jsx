import CustomCascadeEditor from './../custom/CustomCascadeEditor.jsx';

import ScenarioEditor from './ScenarioEditor.js'
import NeuralEditor from './NeuralEditor.js'
import MelodyEditor from './MelodyEditor.js'


class TemporaryEditor {

	constructor(owner, EditorClass, caption){
		this.owner=owner;
		this.EditorClass=EditorClass;
		this.caption=caption;
	}

	render(index=0){
		//method like in CustomEditor
		console.log(this.EditorClass, 'render');
		return (
			<this.EditorClass
				key={index}
				client={this.owner.component}
			/>
		);
	}

};


export default class ClientEditor extends CustomCascadeEditor {

	init(){
		super.init();
		this.caption='ClientEditor';
		this.kind='tab';
		//console.log('ClientEditor.init()', this);
		this.mainMenu=[
			{
				caption:'File',
				children:[
					{
						caption:'Scenario\u00A0editor',//'&nbsp;'
						onClick:(()=>{this.openPage(ScenarioEditor, true, 'scen')}).bind(this),
					},
					{
						caption:'Neural\u00A0editor',
						onClick:(()=>{this.openPage(NeuralEditor, true, 'neural')}).bind(this),
					},
					{
						caption:'Melody\u00A0editor',
						onClick:(()=>{this.openPage(MelodyEditor, true, 'melody')}).bind(this),
					},
				]
			},
			{
				caption:'Edit',
				children:[
					{
						caption:'undo',
					},
					{
						caption:'redo',
					},
				]
			}
		]
	}

	newTemporaryEditor(EditorClass, caption=''){
		//overrided
		if(!caption)
			caption='some capt';
		//console.log('addTemporaryEditor', this);
		let editor = new TemporaryEditor(this, EditorClass, caption);
		return editor;
	}

}
