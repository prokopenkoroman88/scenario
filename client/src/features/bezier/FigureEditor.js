import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CustomEditor } from './../../common/editor/CustomEditor.js';
import { Bezier } from './Bezier.js';
import Screen from './../canvas/Screen.js';

import Drag from './../../common/drag/Drag.js'
import Container from './../../common/drag/Container.js'

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
			mainFigure:null,
			canvas:{
				ref:null,
				obj:null,
			},
		};
		this.drag=new Drag();
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
			case 'Rotor':
				this.bezier.editor.sequence=[];
				break;
			case 'Branch':
				this.bezier.editor.sequence=[];
				break;
			case 'Spline':
				this.bezier.editor.sequence=[];
				break;
			case 'Figure':
				this.bezier.editor.sequence=[];
				break;
			case 'Integrate':
				this.bezier.editor.sequence=[];
				this.props.figure.open();
				this.props.figure.link({
					onOK:null,
					onCancel:(()=>{this.clickArrow()}).bind(this),
				});
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
		const editor=this.bezier.editor;
		const old_curr={...editor.curr};
		let sequence=editor.sequence;
		//console.log('event', x, y, event.altKey?'Alt':'', event.ctrlKey?'Ctrl':'', event.shiftKey?'Shift':'');
		switch (event.type) {
			case 'mousedown':
				this.props.figure.close();
				this.bezier.editor.oldPoint={x,y};
				switch (this.state.mode) {
					case 'Arrow':
						changed=this.choiceBy(x,y);//curr
						let curr=editor.curr;
						let old_item=this.getCurrItem(old_curr);
						let new_item=this.getCurrItem(curr);
						//gather sequence:
						if(new_item){
							let old_index=sequence.indexOf(old_item);
							let new_index=sequence.indexOf(new_item);
							if(event.ctrlKey){
								if(old_item && old_index<0)
									sequence.push(old_item);

								if(new_index<0)
									sequence.push(new_item);
								else
									sequence.splice(new_index, 1);
							}
							else{
								if(new_index<0)
									editor.sequence=[];
							};
						}
						else
							editor.sequence=[];
						break;
					case 'Rotor':
						changed=this.makeRotor(x,y);
						break;
					case 'Branch':
						changed=this.makeBranch(x,y);
						break;
					case 'Spline':
						changed=this.makeSpline(x,y);
						break;
					default:
						break;
				};
				break;
			case 'mousemove':
				switch (this.state.mode) {
					case 'Arrow':
						changed=this.choiceBy(x,y);//curr
						editor.curr=old_curr;
						break;
					default:
						changed=true;
						break;
				};
				break;
			case 'mouseup':
				switch (this.state.mode) {
					case 'Arrow':
						editor.findCurr(x,y, 'rotor');
						if(editor.curr.rotor){

							let old_item=this.getCurrItem(old_curr);
							if(!sequence.length && old_item)
								sequence.push(old_item);

							this.addSequenceTo(editor.curr.rotor);//points & rotors
							editor.sequence=[];
							break;
						};

						editor.findCurr(x,y, 'branch');
						if(editor.curr.branch){

							let old_item=this.getCurrItem(old_curr);
							if(!sequence.length && old_item)
								sequence.push(old_item);

							this.addSequenceTo(editor.curr.branch);//points & nodes
							editor.sequence=[];
							break;
						};

						if(editor.curr.look!==undefined)
							changed=this.resizeItem(x,y);//curr
						else
							changed=this.moveItem(x,y);//curr
						editor.curr.look=undefined;
						break;
					case 'Figure':
						changed=this.addFigure(x,y);
						break;
					case 'Integrate':
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
		const dx=x-this.bezier.editor.oldPoint.x;
		const dy=y-this.bezier.editor.oldPoint.y;
		if(!dx && !dy)
			return changed;

		const curr = this.bezier.editor.curr;
		const sequence = this.bezier.editor.sequence;
		if(sequence.length){
			sequence.forEach((item)=>{
				const bCascade=true;
				item.shift(dx,dy, bCascade);
			});
			changed=true;
		}
		else
		if(curr.point){
			curr.point.shift(dx,dy);
			//пересування точки змінює всі проміжні точки сплайну
			let splines = curr.point.splines;
			splines.forEach(spline=>spline.prepareInterimBezierPoints());
			changed=true;
		}
		else
		if(curr.rotor){
			//переміщення ротора
			const bCascade=true;
			curr.rotor.shift(dx,dy, bCascade);
			changed=true;
		}
		else
		if(curr.lever){
			//переміщення важеля ротора
			const bCascade=true;
			curr.lever.shift(dx,dy, bCascade);
			changed=true;
		}
		else
		if(curr.node){
			//переміщення важеля гілки
			const bCascade=true;
			curr.node.shift(dx,dy, bCascade);
			changed=true;
		}
		else
		if(curr.figure){
			//Переміщення фігури
			const bCascade=true;//разом з підфігурами
			curr.figure.shift(dx,dy, bCascade);
			changed=true;
		}
		return changed;
	}

	resizeItem(x,y){
		//Розтягування елемента на canvas-і
		let changed=false;
		const dx=x-this.bezier.editor.oldPoint.x;
		const dy=y-this.bezier.editor.oldPoint.y;
		if(!dx && !dy)
			return changed;

		const curr = this.bezier.editor.curr;
		if(curr.look<0 || curr.look>7)
			return changed;

		if(curr.figure){
			//Переміщення фігури
			const bCascade=true;//разом з підфігурами

			curr.figure.resize(dx,dy, curr.look, bCascade);
			changed=true;
		};

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
			editor.findCurr(x,y, 'lever');
			editor.findCurr(x,y, 'node');
			editor.findCurr(x,y, 'branch');
			editor.findCurr(x,y, 'spline');
			editor.findCurr(x,y, 'figure');

			if(old_curr.spline && !editor.curr.spline && editor.curr.point){
				if(old_curr.spline.points.indexOf(editor.curr.point)>=0)//leverPoint
					editor.curr.spline=old_curr.spline;//зберегти сплайн
			};
			if(editor.curr.figure){
				//isNear
				let look = editor.curr.figure.calcBorderLook(x,y,editor.settings.CURSOR_RADIUS);
				if(look>=0 && look<8){
					editor.curr.look = look;
					//start figure resizing
				};
			};

		} catch(e) {
			console.log(e);
		} finally {
			this.setCurr();
			return false;
		}

	}

	getCurrItem(curr=null){
		let item=null;
		if(!curr)
			curr=this.bezier.editor.curr;
		if(!item)
			item=curr.point;
		if(!item)
			item=curr.node;
		if(!item)
			item=curr.rotor;
		return item;
	}

	addSequenceTo(main_item){
		let sequence=this.bezier.editor.sequence;
		if(!sequence.length)
			return;
		sequence.forEach(item=>{
			switch (item.constructor.name) {
				case 'Point':
					main_item.points.push(item)
					break;
				case 'Rotor':
					main_item.rotors.push(item)
					break;
				case 'Node':
					main_item.nodes.push(item)
					break;
				default:
					break;
			};//
		});
	}

	makeRotor(x,y){
		let changed=this.bezier.editor.makeRotor(x,y);
		return changed;
	}

	makeBranch(x,y){
		let changed=this.bezier.editor.makeBranch(x,y);
		return changed;
	}

	makeSpline(x,y){
		let changed=this.bezier.editor.makeSpline(x,y);
		return changed;
	}

	addFigure(x,y){
		let editor=this.bezier.editor;
		let figure = editor.addFigure(true);
		let changed = !!figure;
		let params={
			cx:(editor.oldPoint.x+x)/2,
			cy:(editor.oldPoint.y+y)/2,
			width:x-editor.oldPoint.x,
			height:y-editor.oldPoint.y,
			angle:0,
		}
		figure.rect.cx=params.cx;
		figure.rect.cy=params.cy;
		figure.rect.width=params.width;
		figure.rect.height=params.height;
		return changed;
	}

	openFigure(){
		let editor=this.bezier.editor;
		let figureName=this.props.figure.name;
		let original=this.pool.figure(figureName);
		let params={
			cx:original.rect.cx,
			cy:original.rect.cy,
			width:original.rect.width,
			height:original.rect.height,
			angle:0,
		}
		editor.newContent();//clear();
		editor.addLayer();
		editor.curr.figure=original;
		editor.curr.layer.figures.push(editor.curr.figure);
		this.setState({mainFigure:original});
		this.setCurr();
		let changed=true;
		return changed;
	}

	integrateFigure(x,y){
		//Інтегрування фігури в поточну фігуру curr.figure
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
		this.setState({mainFigure:null});
		this.bezier.editor.newPage();
	}

	clickPaint(){
		this.bezier.paint();
		this.optionalPaint();
	}

	optionalPaint(){//by state.show
		const curr = this.bezier.editor.curr;
		const sequence = this.bezier.editor.sequence;
		const content = this.bezier.editor.content;
		const render = this.bezier.render;
		//
		const colorFigureRect='#aa0000';
		const colorCurrFigureRect='#ff0000';
		const colorPoint='#00e0e0';
		const colorRotor='#e00000';
		const colorNode='#00e000';

		function paintPoint(point){
			let radius=accent=='curr'?4:2;
			render.paintEllipse(point, colorPoint, radius);
		}

		function paintNode(node){
			let radius=accent=='curr'?4:2;
			render.paintEllipse(node, colorNode, radius);
		}

		function paintBranch(branch, figure){
			let radius=accent=='curr'?4:2;
			render.paintLine(branch.nodes[0], branch.nodes[1], colorNode);
		}

		function paintRotor(rotor){
			let radius=accent=='curr'?4:3;
			render.paintEllipse(rotor, colorRotor, radius);
			let lever = rotor.leverPoint;
			console.log('rotor', rotor);
			console.log('lever',lever, rotor.lever);
			render.paintEllipse(lever, colorRotor, 2);
			render.paintLine(rotor, lever, colorRotor);
			//
			rotor.points.forEach(point=>render.paintLine(rotor, point, colorRotor));
			rotor.rotors.forEach(rotor2=>render.paintLine(rotor, rotor2, colorRotor));
		}

		function paintSpline(spline){
			let radius=3;
			//усі проміжні точки сплайну
			//spline.interimBezierPoints.forEach(point=>paintPoint(point));
			//точки сплайну
			spline.points.forEach(point=>{
				render.paintEllipse(point, colorPoint, radius);
			})
			//важелі сплайну
			for(let i=0; i<=1; i++)
				render.paintLine(spline.controlPoint[i], spline.leverPoint[i], colorPoint);
		}

		function figureRect(figure){
			if(!figure)
				return;
			render.paintFigureRect(figure, colorFigureRect);
			figure.figures.forEach(figure=>figureRect(figure))
		};

		function figurePoints(figure){
			figure.points.forEach(point=>paintPoint(point));
			figure.figures.forEach(figure=>figurePoints(figure))
		}

		function figureSplines(figure){
			figure.splines.forEach(spline=>{
				spline.interimBezierPoints.forEach(point=>paintPoint(point));
			});
		}

		function figureRotors(figure){
			figure.rotors.forEach(rotor=>paintRotor(rotor));
			figure.figures.forEach(figure=>figureRotors(figure))
		}

		function figureNodes(figure){
			if(figure.nodes)
				figure.nodes.forEach(node=>paintNode(node));
			if(figure.branches)
				figure.branches.forEach(branch=>paintBranch(branch, figure));
			figure.figures.forEach(figure=>figureNodes(figure))
		}

		let accent='all';

		if(this.state.show.indexOf('AllFigures')>=0){
			//рамки фігур
			content.layers.forEach((layer)=>{
				layer.figures.forEach(figure=>figureRect(figure));
			})
		}

		if(this.state.show.indexOf('AllPoints')>=0){
			//точки та ротори
			content.layers.forEach((layer)=>{
				layer.figures.forEach(figure=>figurePoints(figure));
				//layer.figures.forEach(figure=>figureSplines(figure));
				layer.figures.forEach(figure=>figureRotors(figure));
				layer.figures.forEach(figure=>figureNodes(figure));
			});
		}

		accent='curr';

		if(this.state.show.indexOf('Current')>=0){
			//рамка вибраної фігури
			if(curr.figure){
				render.paintFigureRect(curr.figure, colorCurrFigureRect);
			}
			if(sequence.length){
				sequence.forEach(item=>{
					switch (item.constructor.name) {
						case 'Point':
							paintPoint(item);
							break;
						case 'Rotor':
							paintRotor(item);
							break;
						case 'Node':
							paintNode(item);
							break;
						default:
							break;
					};//switch
				})
			}
			//вибрана точка
			if(curr.point)
				paintPoint(curr.point);
			//вибраний ротор
			if(curr.rotor)
				paintRotor(curr.rotor);
			//вибрана нода
			if(curr.node)
				paintNode(curr.node);
			//точки вибраного сплайну
			if(curr.spline)
				paintSpline(curr.spline);
		}
		//this.bezier.canvas.put();//Після стандартних методів canvas - put не потрібен
	}

	clickOpenFigure(){
		this.props.figure.open();
		this.props.figure.link({
			onOK:this.openFigure.bind(this),
			onCancel:null,
		});
	}

	clickSaveJS(){
		let s = '';
		if(this.state.mainFigure){
			s = this.pool.saveMainFigureToCode(this.bezier.content);
		}
		else{
			s = this.pool.saveContentToCode(this.bezier.content);
		};
		console.log(s);
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

	clickRotor(){
		this.setMode('Rotor');
	}

	clickBranch(){
		this.setMode('Branch');
	}

	clickFigure(){
		this.setMode('Figure');
	}

	clickIntegrate(){
		this.setMode('Integrate');
	}

	clickCurrent(){
		this.toggleShow('Current');
	}

	clickAllFigures(){
		this.toggleShow('AllFigures');
	}

	clickAllPoints(){
		this.toggleShow('AllPoints');
	}

	getLeftButtons(){
		let btns=[
			{
				caption:'Arrow',
				className:'toggle'+(this.state.mode=='Arrow'?' active':''),
				onClick:this.clickArrow.bind(this),
			},
			{
				caption:'Rotor',
				className:'toggle'+(this.state.mode=='Rotor'?' active':''),
				onClick:this.clickRotor.bind(this),
			},
			{
				caption:'Branch',
				className:'toggle'+(this.state.mode=='Branch'?' active':''),
				onClick:this.clickBranch.bind(this),
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
				caption:'Integrate',
				className:'toggle'+(this.state.mode=='Integrate'?' active':''),
				onClick:this.clickIntegrate.bind(this),
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
			{
				caption:'Points',
				className:'toggle'+(this.state.show.indexOf('AllPoints')>=0?' active':''),
				onClick:this.clickAllPoints.bind(this),
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
				'--left-panel-width':'65px',
				'--right-panel-width':'0px',
			},
			level:2,
		}
	}

	getContainerCSS(){
		return {
			className:'scroll',//'oval'
			//styles:{},
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
					css={this.getContainerCSS()}
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
