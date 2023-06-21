import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Bezier } from './Bezier.js';

import Block from './../../common/Block.js'

import styles from './beziertree.css';

class BezierItem extends React.Component{
	constructor(props){
		super(props);
		//item
		//bezier
		this.state={
			item:props.item,
		};
		this.attrName=this.props.attrName;
	}

	getClass(){
		let className=this.attrName;
		//console.log('getStyle', attrName, this.state.item);
		let currItem = this.props.bezier.editor.curr[this.attrName];
		if(this.state.item==currItem)
			className+=' active';
		return className;
	}

	render(){
		return (
			<li
				className={this.getClass()}
			>
			{(this.state.item.name) &&
				<h3 className='caption' >{this.state.item.name}</h3>
			}
				{this.props.children}
			</li>
		);///figure custom item
	}
};


class BezierPoint extends React.Component{
	constructor(props){
		super(props);
		//point
		//bezier
		this.state={
		};
	}

	render(){
		let point = this.props.point;
		return (
			<BezierItem
				item={point}
				attrName='point'
				bezier={this.props.bezier}
			>x:{point.x}, y:{point.y} </BezierItem>
		);///
	}
};


class BezierSpline extends React.Component{
	constructor(props){
		super(props);
		//spline
		//bezier
		this.state={
		};
	}

	render(){
		let spline = this.props.spline;
		return (
			<BezierItem
				item={spline}
				attrName='spline'
				bezier={this.props.bezier}
			>
				<p>
				{spline.points.map((point,iPoint)=>
					<span key={iPoint}>
						{point.index},
					</span>
				)}
				</p>
			</BezierItem>
		);///
	}
};


class BezierFigure extends React.Component{
	constructor(props){
		super(props);
		//figure
		//bezier
		this.state={
			figure:props.figure,
		};
	}

	componentDidMount(){
	}

	componentWilUnmount(){
	}

	render(){
		let name='Figure';
		if(this.state.figure)
			name=this.state.figure.name;

		let points=[];
		if(this.state.figure)
			points=this.state.figure.points;

		let splines=[];
		if(this.state.figure)
			splines=this.state.figure.splines;

		let figures=[];
		if(this.state.figure)
			figures=this.state.figure.figures;

		return (
			<li className='figure' >
				<h3 className='caption' >{'Figure '+name}</h3>
				<ul>
					<li className='items' >
						<ul>
							<li className='points' >
								<h4 className='caption' >points</h4>
								<ul>
									{points.map((point, iPoint)=>
										<BezierPoint
											key={iPoint}
											point={point}
											bezier={this.props.bezier}
										></BezierPoint>
									)}
								</ul>
							</li>
							<li className='splines' >
								<h4 className='caption' >splines</h4>
								<ul>
									{splines.map((spline, iSpline)=>
										<BezierSpline
											key={iSpline}
											spline={spline}
											bezier={this.props.bezier}
										></BezierSpline>
									)}
								</ul>
							</li>
						</ul>
					</li>
					<li className='children' >
						<ul>
							<li className='figures' >
								<h4 className='caption' >figures</h4>
								<ul>
									{figures.map((subfigure, iFigure)=>
										<BezierFigure
											key={iFigure}
											figure={subfigure}
											bezier={this.props.bezier}
										></BezierFigure>
									)}
								</ul>
							</li>
						</ul>
					</li>
				</ul>
			</li>
		);///figure with items
	}

};


class BezierTree extends React.Component{
	constructor(props){
		super(props);
		//drag
		//bezier
		this.state={
			content:props.bezier.content,
			curr:props.bezier.editor.curr,
		};
		console.log('BezierTree.constructor');
	}

	componentDidMount(){
		console.log('componentDidMount',this.state.content);
	}

	componentWilUnmount(){
	}

	getCSS(){
		return{
			className:'bezier-tree oval',
			styles:{
				backgroundColor:'#ccc',
				border:'1px outset #ccc',
			},
			level:3,
		}
	}

	getRect(){
		return {
			left:200, 
			top:300,
		};
	}

	render(){
		let layers=[];
		if(this.state.content)
			layers=this.state.content.layers;
		return (
			<Block
				caption='Bezier Content'
				css={this.getCSS()}
				rect={this.getRect()}
				drag={this.props.drag}
			>
				<ul>
				{(layers.length>0) && layers.map((layer,iLayer)=>
					<li className='layer' key={'layer_'+iLayer}>
						<h3 className='caption' >Layer</h3>
						<ul>
						{(layer.figures.length>0) && layer.figures.map((figure,iFigure)=>
							<BezierFigure
								key={'figure_'+iFigure}
								figure={figure}
								bezier={this.props.bezier}
							></BezierFigure>
						)}
						</ul>
					</li>
				)}
				</ul>
			</Block>
		);///tree of figures
	};
}

export { BezierTree };
