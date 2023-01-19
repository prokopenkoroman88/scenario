import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CustomCanvas, VirtualCanvas, RealCanvas } from './canvases.js';


class Screen extends React.Component{

	constructor(props){
		super(props);
		this.state={
		};

		this.ref=React.createRef();
		this.obj=React.createRef();
	};
	

	componentDidMount(){
		this.obj = new RealCanvas(this.ref);//.current
		this.props.getCanvas(this.ref,this.obj);
		if(this.props.delay>0)
		this.int=setInterval(this.clock.bind(this), this.props.delay);

		let w=this.props.rect.width;
		let h=this.props.rect.height;
	};

	componentWilUnmount(){
		if(this.int)
			clearInterval(this.int);
	}

	clock(){
		//this.putData();
	}


	putData(){
		try {
			if(this.obj)
				this.obj.put();
		} catch(e) {
			console.log(e);
		}
	}

	handleMouse(event){
		this.props.onMouse(event.nativeEvent);
	}

	render(){
		return (
			<canvas
				ref={this.ref}
				width={this.props.rect.width}
				height={this.props.rect.height}
				onMouseDown={this.handleMouse.bind(this)}
				onMouseMove={this.handleMouse.bind(this)}
				onMouseUp={this.handleMouse.bind(this)}
			/>
		);
	}

};

export default Screen;
