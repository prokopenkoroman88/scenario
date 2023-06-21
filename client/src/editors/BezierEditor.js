import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from './Editor.js';
import { Bezier } from './../features/bezier/Bezier.js';
import Screen from './../features/canvas/Screen.js';

import drag from './../common/Drag.js'
import Container from './../common/Container.js'

import FigureEditor from './../features/bezier/FigureEditor.js';
import { FiguresTable } from './../features/bezier/data/Figures.js';
import { BezierTree } from './../features/bezier/BezierTree.js';

class BezierEditor extends React.Component{
	constructor(props){
		super(props);
		this.state={
			rect:{
				height : 600,
				width : 1000,
			},
		};
		this.drag=drag;
		this.bezier = new Bezier();
	}

	componentDidMount(){
	}

	getTopButtons(){
		let btns=[
		];
		return btns;
	}

	getCSS(){
		return {
			//className:'',
			//styles:{},
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
					<FigureEditor
						rect={this.state.rect}
						drag={this.drag}
					></FigureEditor>
			</Editor>
		);
	};
}

export default BezierEditor;
