import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import drag from './../common/Drag.js';


const lineOffset=60;
const noteHeight=30;
const step=5;

class Note extends React.Component{
	constructor(props){
		super(props);
		this.state={
			rect:{
				left:0,
				top:this.toneToTop(this.props.note.tone),
			},
		};
		this.drag=drag;
	}

	componentDidMount(){
	}

	toneToTop(tone){ return 100 - tone*step; }

	topToTone(top){ return (100-top)/step; }

	getStyle(){
		return {top:this.state.rect.top };
	}

	componentWilUnmount(){
	}

	handleMouseDown(event){
		this.drag.startDrag(event, this);
		this.props.selectNote(this.props.id);
	}
	handleMouseMove(event){
		this.drag.doDrag(event);
	}
	handleMouseUp(event){
		this.drag.endDrag();
		let top = Math.round(this.state.rect.top/step)*step;
		let tone = this.topToTone(top);

		this.setState(
			prevState=>({
				rect: { ...prevState.rect, top: top}
			})
		);
		this.props.setTone(this.props.id,tone);
	}

	delayClass(){
		let res='';
		if(this.props.note.delay==0) res='d_1';//o
		if(this.props.note.delay==-1) res='d_1_2';//d
		if(this.props.note.delay==-2) res='d_1_4';//d black
		if(this.props.note.delay==-3) res='d_1_8';//d^ black
		if(this.props.note.delay==-4) res='d_1_16';
		if(this.props.note.delay==-5) res='d_1_32';

		if(this.props.note.diese) res+=' diese';

		//if(this.drag.drag.tag){
		if(this.props.id==this.props.editor.state.toolBar.selected_id){
			res+=' active';
		};
		return res;
	}

	render(){
		return (
			<div
				className={"note "+this.delayClass()}
				style={this.getStyle.bind(this)()}
				onMouseDown={this.handleMouseDown.bind(this)}
				onMouseMove={this.handleMouseMove.bind(this)}
				onMouseUp={this.handleMouseUp.bind(this)}
			>
				<div></div>
			</div>
		);
	};

}

export default Note;
