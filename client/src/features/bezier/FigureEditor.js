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
		//pool
		//figure
		this.state={
			screenRect:props.rect,
			containerRect:{
				left:0,
				top:0,
				width:'100%',
				height:'100%',
			},
			mode:'Arrow',
			show:['Current'],
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
		this.pool = this.props.pool;
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
			case 'Figure':
				this.bezier.editor.sequence=[];
				break;
			default:
				break;
		};
		this.setState({mode});
	}

	toggleShow(option='Current'){
		//Для відображення допоміжних елементів
		let show = this.state.show;
		let i=show.indexOf(option);
		if(i<0)
			show.push(option)//+
		else
			show.splice(i, 1);//-
		this.setState({show});
		this.clickPaint();
	}

	setCurr(){
		//Для відображення вибраного елементу у BezierTree
		let curr=this.bezier.editor.curr;
		this.setState({curr});
		this.clickPaint();
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
				this.bezier.editor.oldPoint={x,y};
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
					case 'Figure':
						changed=this.integrateFigure(x,y);
						this.setMode();
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
			//пересування точки змінює всі проміжні точки сплайну
			let splines = this.bezier.editor.curr.point.splines;
			splines.forEach(spline=>spline.prepareInterimBezierPoints());
		}
		else
			if(this.bezier.editor.curr.figure){
				//Переміщення фігури
				const bCascade=true;//разом з підфігурами
				let figure=this.bezier.editor.curr.figure;
				let dx=x-this.bezier.editor.oldPoint.x;
				let dy=y-this.bezier.editor.oldPoint.y;
				if(dx!=0 || dy!=0){
					figure.shift(dx,dy, bCascade);
					changed=true;
				}
			}
		return changed;
	}

	choiceBy(x,y){
		//console.log('choiceBy',x,y,'//Обрання елемента');
		let found;
		try {
			const editor=this.bezier.editor;
			const old_curr={...editor.curr};
			editor.findCurr(x,y, 'point');
			editor.findCurr(x,y, 'rotor');
			editor.findCurr(x,y, 'spline');
			editor.findCurr(x,y, 'figure');

			if(old_curr.spline && !editor.curr.spline && editor.curr.point){
				if(old_curr.spline.points.indexOf(editor.curr.point)>=0)//leverPoint
					editor.curr.spline=old_curr.spline;//зберегти сплайн
			};

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

	integrateFigure(x,y){
		//Інтегрування фігури в поточку фігуру curr.figure
		//фігура м.б. перевернутою, коли x < oldPoint.x
		let editor=this.bezier.editor;
		let figureName=this.props.figure.name;
		let original=this.pool.figure(figureName);
		let params={
			cx:(editor.oldPoint.x+x)/2,
			cy:(editor.oldPoint.y+y)/2,
			width:x-editor.oldPoint.x,
			height:y-editor.oldPoint.y,
			angle:0,
		}
		let changed=editor.integrateFigure(original, params);
		return changed;
	}

//=============== top panel =================

	clickNewPage(){
		this.bezier.editor.newPage();
	}

	clickPaint(){
		this.bezier.paint();
		this.optionalPaint();
	}

	optionalPaint(){//by state.show
		const curr = this.bezier.editor.curr;
		const content = this.bezier.editor.content;
		const render = this.bezier.render;
		//
		const colorFigureRect='#aa0000';
		const colorCurrFigureRect='#ff0000';
		const colorPoint='#00e0e0';

		function figureRect(figure){
			render.paintFigureRect(figure, colorFigureRect);
			figure.figures.forEach(figure=>figureRect(figure))
		};

		if(this.state.show.indexOf('AllFigures')>=0){
			//рамки фігур
			content.layers.forEach((layer)=>{
				layer.figures.forEach(figure=>figureRect(figure));
			})
		}

		if(this.state.show.indexOf('Current')>=0){
			//рамка вибраної фігури
			if(curr.figure){
				render.paintFigureRect(curr.figure, colorCurrFigureRect);
			}
			//вибрана точка
			if(curr.point)
				render.paintEllipse(curr.point, colorPoint, 4);
			//точки вибраного сплайну
			if(curr.spline){
				curr.spline.points.forEach(point=>{
					render.paintEllipse(point, colorPoint, 2);
				})
				//важелі сплайну
				for(let i=0; i<=1; i++)
					render.paintLine(curr.spline.controlPoint[i], curr.spline.leverPoint[i], colorPoint);
			}
		}
		//this.bezier.canvas.put();//Після стандартних методів canvas - put не потрібен
	}

	clickOpenFigure(){
		let figureName=this.props.figure.name;
		this.pool.openFigure(this.bezier.editor, figureName);
		this.clickPaint();
		console.log('bezier', this.bezier);
	}

	clickSaveJS(){
		let figure = this.bezier.content.layers[0].figures[0];
		this.pool.saveFigureToCode(figure);
	}

	getTopButtons(){
		let btns={
			'New':this.clickNewPage.bind(this),
			'Paint':this.clickPaint.bind(this),
			'Open':this.clickOpenFigure.bind(this),
			'SaveJS':this.clickSaveJS.bind(this),
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

	clickFigure(){
		this.setMode('Figure');
	}

	clickCurrent(){
		this.toggleShow('Current');
	}

	clickAllFigures(){
		this.toggleShow('AllFigures');
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
			{
				caption:'Figure',
				className:'toggle'+(this.state.mode=='Figure'?' active':''),
				onClick:this.clickFigure.bind(this),
			},
			{
				className:'separator',
			},
			{
				caption:'Curr',
				className:'toggle'+(this.state.show.indexOf('Current')>=0?' active':''),
				onClick:this.clickCurrent.bind(this),
			},
			{
				caption:'Rects',
				className:'toggle'+(this.state.show.indexOf('AllFigures')>=0?' active':''),
				onClick:this.clickAllFigures.bind(this),
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
