import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import ButtonPanel from './common/editor/ButtonPanel.js'
import ScenarioEditor from './editors/ScenarioEditor.js'
import PictureEditor from './editors/PictureEditor.jsx'
import NeuralEditor from './editors/NeuralEditor.js'
import MelodyEditor from './editors/MelodyEditor.js'

const editorList=[
	//{mode:'MainBoard', tag:null, caption:'', },
	{mode:'ScenarioEditor', tag:ScenarioEditor, caption:'Редактор сценаріїв', },
	{mode:'PictureEditor', tag:PictureEditor, caption:'Редактор зображень', },
	{mode:'NeuralEditor', tag:NeuralEditor, caption:'Редактор нейромереж', },
	{mode:'MelodyEditor', tag:MelodyEditor, caption:'Редактор мелодій', },
];

class Client extends React.Component{
	constructor(props){
		super(props);
		this.state={
			mode:'MainBoard',
		};
	}

	componentDidMount(){
	}

	handleMode(name){
		this.setState({mode:name});
	}

	componentWilUnmount(){
	}

	getTopButtons(){
		let btns=[];
		editorList.forEach(editor=>{
			btns.push({
				caption:editor.caption,
				onClick:((e)=>{this.handleMode(editor.mode)}).bind(this),
			})
		});
		return btns;
	}

	renderMainBoard(){
		return (
			<div>
				<ButtonPanel
					btns={this.getTopButtons()}
					className='center'
				/>
			</div>
		)
	}

	renderEditors(){
		for(let editor of editorList){
			if(editor.mode===this.state.mode){
				return (<editor.tag
					client={this}
				/>)
			}
		};
		if(this.state.mode==='MainBoard')
			return this.renderMainBoard();
		return null;
	}

	render(){
		return (
			<div className='client'>
				{this.renderEditors()}
			</div>
		);
	};
};

export default Client;
