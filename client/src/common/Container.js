import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

class Container extends React.Component{
	constructor(props){
		super(props);
		//drag
		//rect
		this.state={
			rect:props.rect,
		};
	}

	handleMouseMove(event){
		this.props.drag.doDrag(event);
	}

	handleMouseUp(event){
		this.props.drag.endDrag();
	}

	getClass(){
		let className='container';
		className+=' oval';
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
