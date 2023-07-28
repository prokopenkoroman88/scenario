import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

class Container extends React.Component{
	constructor(props){
		super(props);
		//drag
		//rect
		//css
		this.state={
			rect:props.rect,
		};
		this.className=this.props.css?this.props.css.className:'oval';
		this.styles=this.props.css?this.props.css.styles:{};
	}

	handleMouseMove(event){
		this.props.drag.doDrag(event);
	}

	handleMouseUp(event){
		this.props.drag.endDrag();
	}

	getClass(){
		let className='container';
		if(this.className)
			className+=' '+this.className;
		return className;
	}

	getStyle(){
		return {
			width:this.state.rect.width,
			height:this.state.rect.height,
		};
	}

	render(){
		return (
			<div
				className={this.getClass()} 
				style={this.getStyle()} 
				onMouseMove={this.handleMouseMove.bind(this)}
				onMouseUp  ={this.handleMouseUp.bind(this)}
			>
				{this.props.children}
			</div>
		)
	}
}

export default Container;
