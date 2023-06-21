import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CustomEditor } from './../../common/CustomEditor.js';
import { Bezier } from './Bezier.js';
import Screen from './../canvas/Screen.js';

import drag from './../../common/Drag.js'
import Container from './../../common/Container.js'

import { FiguresTable } from './data/Figures.js';
import { BezierTree } from './BezierTree.js';

class FigureEditor extends React.Component{
	constructor(props){
		super(props);
		//rect
		//bezier?
		this.state={
			screenRect:props.rect,
			containerRect:{
				left:0,
				top:0,
				width:'100%',
				height:'100%',
			},
			mode:'Arrow',
			curr:{},
			canvas:{
				ref:null,
				obj:null,
			},
		};
		this.drag=drag;
		if(this.props.bezier)
			this.bezier = this.props.bezier;
		else
			this.bezier = new Bezier(this.state.canvas.obj);
	}

//========= states setters ==========

	setMode(mode='Arrow'){
		//console.log('mode',mode);
		switch (mode) {
			case 'Arrow':
				this.bezier.editor.sequence=[];
				break;
			case 'Spline':
				this.bezier.editor.sequence=[];
				break;
			default:
				break;
		};
		this.setState({mode});
	}

	setCurr(){
		//Для відображення вибраного елементу у BezierTree
		let curr=this.bezier.editor.curr;
		this.setState({curr});
	}

	setCanvas(ref,obj){
		this.setState(
			prevState=>({
				canvas: { ...prevState.canvas, ref, obj}
			})
		);
		this.bezier.setCanvas(obj);
	}

//==========

	componentDidMount(){
		console.log('componentDidMount',this.state.canvas);
	}

	handleGetCanvas(ref,obj){
		this.setCanvas(ref,obj);
	}

	handleMouse(event){
		let changed=false;
		let x=event.offsetX;
		let y=event.offsetY;
		//console.log('event', x, y, event.altKey?'Alt':'', event.ctrlKey?'Ctrl':'', event.shiftKey?'Shift':'');
		switch (event.type) {
			case 'mousedown':
				switch (this.state.mode) {
					case 'Arrow':
						changed=this.choiceBy(x,y);//curr
						break;
					case 'Spline':
						changed=this.makeSpline(x,y);
						break;
					default:
						break;
				};
				break;
			case 'mousemove':
				break;
			case 'mouseup':
				switch (this.state.mode) {
					case 'Arrow':
						changed=this.moveItem(x,y);//curr
						break;
					default:
						break;
				};
				break;
			default:
				break;
		};
		if(changed){
			this.setState({content:this.bezier.content});
			this.clickPaint();
		}
	}

//========= mouse functions ==========

	moveItem(x,y){
		//Переміщення елемента на canvas-і
		let changed=false;
		if(this.bezier.editor.curr.point){
			this.bezier.editor.curr.point.x=x;
			this.bezier.editor.curr.point.y=y;
			changed=true;
		};
		return changed;
	}

	choiceBy(x,y){
		//console.log('choiceBy',x,y,'//Обрання елемента');
		let found;
		try {
			//
			found=this.bezier.editor.findByCoords('point',x,y);
			if(found && found.point>=0){
				this.bezier.editor.curr.point=this.bezier.content.layers[found.layer].figures[found.figure].points[found.point];
				return;
			}
			else
				this.bezier.editor.curr.point=null;
			//
			found=this.bezier.editor.findByCoords('rotor',x,y);
			if(found && found.rotor>=0){
				this.bezier.editor.curr.rotor=this.bezier.content.layers[found.layer].figures[found.figure].rotors[found.rotor];
				return;
			}
			else
				this.bezier.editor.curr.rotor=null;
			//
			found=this.bezier.editor.findByCoords('spline',x,y);
			if(found && found.spline>=0){
				this.bezier.editor.curr.spline=this.bezier.content.layers[found.layer].figures[found.figure].splines[found.spline];
				return;
			}
			else
				this.bezier.editor.curr.spline=null;

		} catch(e) {
			console.log(e);
		} finally {
			this.setCurr();
			return false;
		}

	}

	makeSpline(x,y){
		let changed=this.bezier.editor.makeSpline(x,y);
		return changed;
	}

//=============== top panel =================

	clickNewPage(){
		this.bezier.editor.newPage();
	}

	clickPaint(){
		this.bezier.paint();
	}

	getTopButtons(){
		let btns={
			'New':this.clickNewPage.bind(this),
			'Paint':this.clickPaint.bind(this),
		}
		return btns;
	}

//========== Left panel =========

	clickArrow(){
		this.setMode('Arrow');
	}

	clickSpline(){
		this.setMode('Spline');
	}

	getLeftButtons(){
		let btns=[
			{
				caption:'Arrow',
				className:'toggle'+(this.state.mode=='Arrow'?' active':''),
				onClick:this.clickArrow.bind(this),
			},
			{
				caption:'Spline',
				className:'toggle'+(this.state.mode=='Spline'?' active':''),
				onClick:this.clickSpline.bind(this),
			},
		];
		return btns;
	}

	getCaption(){
		return 'Figure '//+this.props.figure.name
	}

	getCSS(){
		return {
			//className:'',
			styles:{
				margin: '0 auto',
			},
			level:2,
		}
	}

	componentWilUnmount(){}

	render(){
		let btns={
			top:this.getTopButtons(),
			left:this.getLeftButtons(),
		};
		return (
			<CustomEditor
				caption={this.getCaption()}
				css={this.getCSS()}
				btns={btns}

			>
				<Container
					drag={this.drag}
					rect={this.state.containerRect}
				>
				<Screen
					rect={this.state.screenRect}
					getCanvas={this.handleGetCanvas.bind(this)}
					onMouse={this.handleMouse.bind(this)}
				></Screen>
				{(this.bezier) &&
					<BezierTree
						drag={this.drag}
						bezier={this.bezier}
					/>
				}
				</Container>
			</CustomEditor>
		);
	};
}

export default FigureEditor;
