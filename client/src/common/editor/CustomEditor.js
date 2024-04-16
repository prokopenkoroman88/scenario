import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import Caption from './../drag/Caption.js'
import ButtonPanel from './ButtonPanel.js'

import styles from './styles.css'

class CustomEditor extends React.Component{
	constructor(props){
		super(props);
		//caption
		//css
		//drag?
		//btns {top, left, right}
		this.state={
			btns:props.btns,
		};
		this.className=this.props.css?this.props.css.className:'oval';
		this.styles=this.props.css?this.props.css.styles:{};
		this.level=this.props.css?this.props.css.level:0;
		console.log('this.styles',this.props.css);
	}

	componentDidMount(){
	}

	getClass(){
		let className = 'editor';
		if(this.className)
			className+=' '+this.className;
		if(!this.props.children)
			className+=' empty';
		return className;
	}

	getStyle(){
		return {
			...this.styles,
		};
	}

	componentWilUnmount(){
	}

	render(){
		let topBtns, leftBtns, rightBtns;
		if(this.props.btns){
			topBtns=this.props.btns.top;
			leftBtns=this.props.btns.left;
			rightBtns=this.props.btns.right;
		};
		return (
			<div
				className={this.getClass()}
				style={this.getStyle()} 
			>
				<Caption
					block={this}
					drag={this.props.drag}
					level={this.level}
				>{this.props.caption}</Caption>
			{(topBtns) &&
				<ButtonPanel
					btns={topBtns}
				/>
			}
				<div className='main-with-asides'


				>
				{(leftBtns) &&
					<ButtonPanel
						btns={leftBtns}
						className='vert left'
					/>
				}
					<div
						className='main'
					>
						{this.props.children}
					</div>
				{(rightBtns) &&
					<ButtonPanel
						btns={rightBtns}
						className='vert right'
					/>
				}
				</div>
			</div>
		);
	};
};

export { CustomEditor };
