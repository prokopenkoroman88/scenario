import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

import Caption from './Caption.js'

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
		this.className=this.props.css?this.props.css.className:'oval';
		this.styles=this.props.css?this.props.css.styles:{};
		this.level=this.props.css?this.props.css.level:0;
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
