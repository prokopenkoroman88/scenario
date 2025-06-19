import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

import Caption from './Caption.js'

import styles from './../drag/styles.css';

class Block extends React.Component{
	constructor(props){
		super(props);
		//drag
		//caption
		//rect {left, top, }
		//css { className, styles, level }
		this.state={
			rect:props.rect,
		};
//		this.className=this.props.css?this.props.css.className:'oval';
//		this.styles=this.props.css?this.props.css.styles:{};
//		this.level=this.props.css?this.props.css.level:0;
	}

	get className(){return this.props.css?this.props.css.className:'oval';}
	get styles(){return this.props.css?this.props.css.styles:{};}
	get level(){return this.props.css?this.props.css.level:0;}


	handleMouseDown(event){
		//console.log('handleMouseDown', this.props.drag);
		if(this.props.drag && this.props.drag.onBlockMouseDown)
			this.props.drag.onBlockMouseDown(event, this);
	}

	handleMouseMove(event){
		//console.log('handleMouseMove', this.props.drag.drag, this.props.drag.drag.tag);
		if(this.props.drag && this.props.drag.onBlockMouseMove)////////???????????
			this.props.drag.onBlockMouseMove(event, this);
	}

	handleMouseUp(event){
		if(this.props.drag && this.props.drag.onBlockMouseUp)////////???????????
			this.props.drag.onBlockMouseUp(event, this);
	}


////

	afterDrag(){
		//console.log('afterDrag', this.props.afterDrag);
		if(this.props.afterDrag)
			this.props.afterDrag(this.state.rect);
	}

	getClass(){
		let className = 'block';
		if(this.className)
			className+=' '+this.className;
		if(!this.props.children)
			className+=' empty';
		return className;
	}

	getStyle(){
		return {
			...this.styles,
			left:this.state.rect.left, 
			top:this.state.rect.top,
			width:this.props.rect.width,//state
			height:this.props.rect.height,//state
		};
	}

	render(){
		return (
			<div
				className={this.getClass()}
				style={this.getStyle()} 
				onMouseDown={this.handleMouseDown.bind(this)}
				onMouseMove={this.handleMouseMove.bind(this)}
				onMouseUp={this.handleMouseUp.bind(this)}
			>
				<Caption
					block={this}
					drag={this.props.drag}
					level={this.level}
				>{this.props.caption}</Caption>
				{this.props.children}
			</div>
		)
	}
}

export default Block;
