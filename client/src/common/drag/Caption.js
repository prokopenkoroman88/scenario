import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

class Caption extends React.Component{
	constructor(props){
		super(props);
		//block
		//drag
		//level
		this.state={
		};
	}

	handleMouseDown(event){
		//console.log('handleMouseDown', this.props.drag);
		if(this.props.drag && this.props.drag.onCaptionMouseDown)
			this.props.drag.onCaptionMouseDown(event, this.props.block);
/*
		if(this.props.drag)
			this.props.drag.startDrag(event, this.props.block);
//*/
	}

	handleMouseMove(event){
		//console.log('handleMouseMove', this.props.drag);
		if(this.props.drag && this.props.drag.onCaptionMouseMove)
			this.props.drag.onCaptionMouseMove(event);
	}

	handleMouseUp(event){
		//console.log('handleMouseUp', this.props.drag);
		if(this.props.drag && this.props.drag.onCaptionMouseUp)
			this.props.drag.onCaptionMouseUp(event);
	}

	getClass(){
		let className='caption';
		return className;
	}

	getTag(level){
		let Tag='div';
		if(level>=1 && level<=6)
			Tag=`h${level}`;
		return Tag;
	}

	render(){
		const Tag=this.getTag(this.props.level);
		return (
			<Tag
				className={this.getClass()}
				onMouseDown={this.handleMouseDown.bind(this)}
				onMouseMove={this.handleMouseMove.bind(this)}
				onMouseUp={this.handleMouseUp.bind(this)}
			>{this.props.children}</Tag>);
	}
}

export default Caption;
