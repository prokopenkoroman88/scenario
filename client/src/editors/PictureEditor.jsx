import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from './Editor.js';
import Picture from './../features/picture/Picture.js';
import PicturePool from './../features/picture/data/PicturePool.js';
import Screen from './../features/canvas/Screen.js';

import Drag from './../common/drag/Drag.js'
import Block from './../common/drag/Block.js'
import Container from './../common/drag/Container.js'

import FigureEditor from './../features/picture/FigureEditor.jsx';
import FigureSelect from './../features/picture/controls/FigureSelect.jsx';

const FIGURE_MODE='FigureEditor';
const DEFAULT_MODE=FIGURE_MODE;

class PictureEditor extends React.Component{
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
		this.picture = new Picture();
		this.pool = new PicturePool();
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
				caption='Picture editor'
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

export default PictureEditor;
