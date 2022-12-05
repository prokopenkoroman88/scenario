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

	play(){
		this.player.play(this.state.notes);
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<div>
			</div>
		);
	};
};

export default MelodyEditor;
