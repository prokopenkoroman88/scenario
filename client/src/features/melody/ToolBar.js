import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';


class ToolBar extends React.Component{
	constructor(props){
		super(props);
		this.state={
		};
		this.lines = [1,2,3,4,5];

		this.delays = new Array(8);//[0,1,2,3,4,5,6,7];
		for(let i=0; i<this.delays.length; i++ ){
			this.delays[i]={
				setDelay:(()=>{
					this.props.editor.setDelay(-i);//.bind(this.props.editor)
				}).bind(this),

				setClass:((delay)=>{
					//
					//let delay = -i;
					let noteDelay = this.props.editor.state.toolBar.noteDelay;//[0, -1, -2, -3, -4, ...]
					//noteDelay = Math.pow(2,noteDelay);//-2 -> 0.25
					if(delay == noteDelay)
						return 'active'
					else
						return '';

				}).bind(this),
			}
		};//i++

	}

	toggleDiese(){
		let oldValue = this.props.editor.state.toolBar.noteDiese;
		this.props.editor.setDiese(!oldValue);
	}

	componentDidMount(){
	}

	loadMelody(){
		let loadedNotes=[{tone:1, delay:0, }, {tone:2, delay:-1, }, {tone:3, delay:-2, }, {tone:4, delay:-3, }, {tone:5, delay:-4, }, {tone:6, delay:-3, }, {tone:7, delay:-2, }, {tone:8, delay:-1, }, {tone:9, delay:-1, }, {tone:10, delay:-2, }, {tone:11, delay:-3, }, {tone:12, delay:-2, }, {tone:13, delay:-1, }, {tone:14, delay:-2, },         ];
		this.props.editor.setState({notes:loadedNotes});
		console.log('notes',this.props.editor.state.notes);
	}

	saveMelody(){
		console.log('notes',this.props.editor.state.notes);
	}

	delayClass(delay){
		let noteDelay = this.props.editor.state.toolBar.noteDelay;//[0, -1, -2, -3, -4, ...]
		//noteDelay = Math.pow(2,noteDelay);//-2 -> 0.25
		if(delay == noteDelay)
			return 'active'
		else
			return '';
	}

	dieseClass(){
		let noteDiese = this.props.editor.state.toolBar.noteDiese;
		//noteDelay = Math.pow(2,noteDelay);//-2 -> 0.25
		if(noteDiese)
			return 'active'
		else
			return '';
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<div
				className="toolbar"
			>
				<button
					onClick={this.loadMelody.bind(this)}
				>Load</button>
				<button
					onClick={this.saveMelody.bind(this)}
				>Save</button>
				<button
					className={this.dieseClass()}
					onClick={this.toggleDiese.bind(this)}
				>♯</button>
				{this.delays.map((delay, index)=>
					<button
						key={'btn_'+index}
						className={delay.setClass(-index)}
						onClick={delay.setDelay}
					>1/{1/Math.pow(2,-index)}</button>
				)}
				<button
					onClick={this.props.editor.play.bind(this.props.editor)}
				>PLAY</button>
			</div>
		);
	};

}

export default ToolBar;
