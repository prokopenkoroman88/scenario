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
		if(this.props.drag)
			this.props.drag.startDrag(event, this.props.block);
	}

	getClass(){
		let className='caption';
		return className;
	}

	render(){
		switch (this.props.level) {
			case 1: return (
				<h1
					className={this.getClass()}
					onMouseDown={this.handleMouseDown.bind(this)}
				>{this.props.children}</h1>);
			case 2: return (
				<h2
					className={this.getClass()}
					onMouseDown={this.handleMouseDown.bind(this)}
				>{this.props.children}</h2>);
			case 3: return (
				<h3
					className={this.getClass()}
					onMouseDown={this.handleMouseDown.bind(this)}
				>{this.props.children}</h3>);
			case 4: return (
				<h4
					className={this.getClass()}
					onMouseDown={this.handleMouseDown.bind(this)}
				>{this.props.children}</h4>);
			case 5: return (
				<h5
					className={this.getClass()}
					onMouseDown={this.handleMouseDown.bind(this)}
				>{this.props.children}</h5>);
			case 6: return (
				<h6
					className={this.getClass()}
					onMouseDown={this.handleMouseDown.bind(this)}
				>{this.props.children}</h6>);
			default: return (
				<div
					className={this.getClass()}
					onMouseDown={this.handleMouseDown.bind(this)}
				>{this.props.children}</div>);
		}
	}
}

export default Caption;
