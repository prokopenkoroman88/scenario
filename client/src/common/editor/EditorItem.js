import Drag from './../drag/Drag.js'
import Block from './../drag/Block.js'

export default class EditorItem{
//base class for managing Editor state through popup React components

	constructor(editor, stateName){
		this.editor=editor;
		this.stateName=stateName;
		this.initState();
	}

	get drag(){
		return this.editor.drag;
	}

	//States:

	getDefaultState(){
		return null;
	}

	getDefaultBlockState(){
		return {
			opened:false,
			caption:undefined,
			rect:{
				left:0,
				top:0
			},
		};
	}


	initState(stateName=''){
		if(!stateName)
			stateName=this.stateName;
		this.editor.state[stateName]=this.getDefaultState();
	}

	setState(name, value, stateName=''){
		if(!stateName)
			stateName=this.stateName;
		this.editor.setState(
			// prevState=>({
			// 	[stateName]: { ...prevState[stateName], [name]: value}
			// })

			prevState=>{
				let newState =
				{
					[stateName]: { ...prevState[stateName], [name]: value}
				};
				console.log('newState', newState);
				return newState;
			}
		);
	}

	getState(name, stateName=''){
		if(!stateName)
			stateName=this.stateName;
		let value = this.editor.state[stateName][name];
		return value;
	}


	//methods:

	open(){
		this.setState('opened', true);
	}

	close(){
		this.setState('opened', false);
	}

	change(event, name, stateName=''){
		let value = event.target.value;
		this.setState(name, value, stateName);
	}

	confirm(){//override
	}

	cancel(){//override
	}

	clickOK(){
		if(this.confirm)
			this.confirm();
		this.close();
	}

	clickCancel(){
		if(this.cancel)
			this.cancel();
		this.close();
	}

	prepareItems(items, bAddNone, func=null){
		if(!func)
			func=((item)=>{
				return {id:item.name, name:item.name}
			});
		items = items.map((item)=>func(item));
		if(bAddNone)
			items.unshift({id:'', name:'<none>'});//for unselected
		return items;
	}

	//rendering:

	render(){
		return null;
	}

	renderSelect(items, value, onChange){
		return (
			<select
				value={value}
				onChange={(event)=>{onChange(event)}}
			>
			{items.map((item, index)=>
				<option
					key={index}
					value={item.id}
				>{item.name}</option>
			)}
			</select>
		)
	}

	renderButton(caption, onClick){
		return (
			<button
				onClick={onClick.bind(this)}
			>{caption}</button>
		);//
	}

	renderOK(){
		return this.renderButton('OK', this.clickOK);
	}

	renderCancel(){
		return this.renderButton('X', this.clickCancel);
	}

	//Block:

	getRect(){
		return this.getState('rect');
	}

	getCaption(){
		let caption = this.getState('caption');
		if(caption===undefined)//not ''
			caption=this.constructor.name;//'EditorItem';
		return caption;
	}

	getCSS(){
		return {
			className:'oval',
			styles:{
				'background':'lightgray',
			},
			level:3,
		}
	}

	renderBlock(){
		if(!this.getState('opened'))
			return null;
		return (
			<Block
				drag={this.drag}
				rect={this.getRect()}
				caption={this.getCaption()}
				css={this.getCSS()}
			>
				{this.render()}
			</Block>
		);//
	}

}
