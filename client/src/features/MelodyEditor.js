import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Player from './melody/Player.js'

class MelodyEditor extends React.Component{
	constructor(props){
		super(props);
		this.state={
			notes:[],
		};
		console.log('MelodyEditor.constructor');
		this.player= new Player();
	}

	componentDidMount(){
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
				<Notation
					editor={this}
					notes={this.state.notes}
					setTone={this.setTone.bind(this)}
				></Notation>
			</div>
		);
	};
};

export default MelodyEditor;
