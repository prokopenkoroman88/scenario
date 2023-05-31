import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from './Editor.js';
import { Bezier } from './../features/bezier/Bezier.js';
import Screen from './../features/canvas/Screen.js';


class BezierEditor extends React.Component{
	constructor(props){
		super(props);
		this.state={
			rect:{
				height : 600,
				width : 1000,
			},
			// cnv:{
			// 	ref:null,
			// 	obj:null,
			// },
		};
		this.cnv = {
			ref:null,
			obj:null,
		};
	}

	componentDidMount(){
		console.log('componentDidMount',this.state.ref,this.cnv.ref);
	}

	handleGetCanvas(ref,obj){
		this.cnv.ref=ref;
		this.cnv.obj=obj;
		this.bezier = new Bezier(this.cnv.obj);
		console.log('cnv:  ',this.cnv);
		console.log('bezier',this.bezier);
	}

	handleClickPaint(){
		this.bezier.paint();
	}

	handleMouse(event){
		let x=event.offsetX;
		let y=event.offsetY;
		//event.altKey, event.ctrlKey, event.shiftKey
		switch (event.type) {
			case 'mousedown':
				break;
			case 'mousemove':
				break;
			case 'mouseup':
				break;
			default:
				break;
		};
	}

	componentWilUnmount(){
		//delay={125*10.00020}
	}

	render(){
		return (
			<Editor
				client={this.props.client}
				caption='Bezier editor'
			>
				<div>
					<button
						onClick={this.handleClickPaint.bind(this)}
					>paint</button>
				</div>
				<Screen
					rect={this.state.rect}
					getCanvas={this.handleGetCanvas.bind(this)}
					onMouse={this.handleMouse.bind(this)}
				></Screen>
			</Editor>
		);
	};
}

export default BezierEditor;
