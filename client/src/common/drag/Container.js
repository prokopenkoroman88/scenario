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

	handleMouseDown(event){
		//console.log('handleMouseDown', this.props.drag);
		if(this.props.drag && this.props.drag.onContainerMouseDown)
			this.props.drag.onContainerMouseDown(event);
	}

	handleMouseMove(event){
		//console.log('handleMouseMove', this.props.drag.drag, this.props.drag.drag.tag);
		if(this.props.drag && this.props.drag.onContainerMouseMove)
			this.props.drag.onContainerMouseMove(event);
/*
		if(this.props.drag.doDrag)////////???????????
		this.props.drag.doDrag(event);
//*/
	}

	handleMouseUp(event){
		//console.log('handleMouseUp', this.props.drag);
		if(this.props.drag && this.props.drag.onContainerMouseUp)
			this.props.drag.onContainerMouseUp(event);
/*
		try{
			console.log('handleMouseUp', this , this.props.drag.drag.tag);
			if(this.props.onMouseUp)
				this.props.onMouseUp(event);
		}
		catch(e){
			console.log(e);
		}
		if(this.props.drag.endDrag)////////???????????
		this.props.drag.endDrag();
//*/
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
				onMouseDown={this.handleMouseDown.bind(this)}
				onMouseMove={this.handleMouseMove.bind(this)}
				onMouseUp  ={this.handleMouseUp.bind(this)}
			>
				{this.props.children}
			</div>
		)
	}
}

export default Container;
