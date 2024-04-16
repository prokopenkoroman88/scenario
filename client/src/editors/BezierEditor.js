import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from './Editor.js';
import { Bezier } from './../features/bezier/Bezier.js';
import BezierPool from './../features/bezier/data/BezierPool.js';
import Screen from './../features/canvas/Screen.js';

import Drag from './../common/drag/Drag.js'
import Block from './../common/drag/Block.js'
import Container from './../common/drag/Container.js'

import FigureEditor from './../features/bezier/FigureEditor.js';
import { FiguresTable } from './../features/bezier/data/Figures.js';
import FigureSelect from './../features/bezier/controls/FigureSelect.js';
import { BezierTree } from './../features/bezier/BezierTree.js';

const FIGURE_MODE='FigureEditor';
const DEFAULT_MODE=FIGURE_MODE;

class BezierEditor extends React.Component{
	constructor(props){
		super(props);
		this.state={
			rect:{
				height : 600,
				width : 1000,
			},
			containerRect:{
				left:0,
				top:0,
				width:'100%',
				height:'100%',
			},
			mode:DEFAULT_MODE,
			figureSelect:{},
		};
		this.drag = new Drag();
		this.bezier = new Bezier();
		this.pool = new BezierPool();
		this.figureSelect = new FigureSelect(this, this.pool);//initState
	}

	setMode(mode=DEFAULT_MODE){
		switch (mode) {
			case FIGURE_MODE:
				break;
			default:
				break;
		};
		this.setState({mode});
	}

	componentDidMount(){
	}

	getTopButtons(){
		let btns=[
			{
				caption:'Figure',
				className:'toggle'+(this.state.mode==FIGURE_MODE?' active':''),
				onClick:(()=>{this.setMode(FIGURE_MODE)}).bind(this),
			},
		];
		return btns;
	}

	renderEditors(){
		switch (this.state.mode) {
			case FIGURE_MODE:
				return (
					<FigureEditor
						rect={this.state.rect}
						drag={this.drag}
						pool={this.pool}
						figure={this.figureSelect}
					/>
				)
			default:
				return null;
		}
	}

	renderFigureSelect(){
		return this.figureSelect.renderBlock();
	}

	getCSS(){
		return {
			//className:'',
			styles:{
				'--left-panel-width':'0px',
				'--right-panel-width':'0px',
			},
			level:1,
		}
	}

	componentWilUnmount(){
	}

	render(){
		let btns={
			top:this.getTopButtons(),
		};
		return (
			<Editor
				client={this.props.client}
				caption='Bezier editor'
				css={this.getCSS()}
				btns={btns}
			>
				<Container
					drag={this.drag}
					rect={this.state.containerRect}
				>
					{this.renderEditors()}
					{this.renderFigureSelect()}
				</Container>
			</Editor>
		);
	};
}

export default BezierEditor;
