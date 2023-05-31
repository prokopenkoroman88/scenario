import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import ToolBar from './melody/ToolBar.js'
import Notation from './melody/Notation.js'
import Player from './melody/Player.js'

class MelodyEditor extends React.Component{
	constructor(props){
		super(props);
		this.state={
			notes:[],
			toolBar:{
				noteDelay:0,
				noteDiese:false,
				selected_id:-1,
			},
		};
		console.log('MelodyEditor.constructor');
		this.player= new Player();
	}

	componentDidMount(){
	}


	selectNote(id){
		let note = this.state.notes[id];

		this.setState(prevState => ({
			toolBar: { ...prevState.toolBar, selected_id:id}
		}));

		this.setState(prevState => ({
			toolBar: { ...prevState.toolBar, noteDelay:note.delay}
		}));

		this.setState(prevState => ({
			toolBar: { ...prevState.toolBar, noteDiese:note.diese}
		}));

	}

	setDelay(delay){
		console.log('setDelay',this.state);
		let id = this.state.toolBar.selected_id;
		if(id === undefined)return;

		//this.props.editor.state.toolBar.noteDelay;//[0, -1, -2, -3, -4, ...]
		this.setState(prevState => ({
			toolBar: { ...prevState.toolBar, noteDelay:delay}
		}));

		let newNotes = this.state.notes;
		newNotes[id].delay=delay;
		this.setState({notes:newNotes});
	}

	setDiese(diese){
		console.log('setDiese',this.state);
		let id = this.state.toolBar.selected_id;
		if(id === undefined)return;

		let tone = this.state.notes[id].tone;//1..14
		if(!this.player.mayDiese(tone))return;

		//this.props.editor.state.toolBar.noteDelay;//[0, -1, -2, -3, -4, ...]
		this.setState(prevState => ({
			toolBar: { ...prevState.toolBar, noteDiese:diese}
		}));

		let newNotes = this.state.notes;
		newNotes[id].diese=diese;
		this.setState({notes:newNotes});
	}

	setTone(id,tone){
		let newNotes = this.state.notes;
		newNotes[id].tone=tone;
		this.setState({notes:newNotes});
	}

	play(){
		this.player.play(this.state.notes);
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<div>
				<ToolBar
					editor={this}
					notes={this.state.notes}
				></ToolBar>
				<Notation
					editor={this}
					notes={this.state.notes}
					setTone={this.setTone.bind(this)}
					selectNote={this.selectNote.bind(this)}
				></Notation>
			</div>
		);
	};
};

export default MelodyEditor;
