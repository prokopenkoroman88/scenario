import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Neural } from './neural/Neural.js';
import { AreaTest } from './neural/AreaTest.js';
import NetworkTree from './neural/NetworkTree.js';
import Screen from './canvas/Screen.js';


class NeuralEditor extends React.Component{
	constructor(props){
		super(props);
		this.state={
			rect:{
				height : 600,
				width : 1000,
			},
			neural : null,
			// cnv:{
			// 	ref:null,
			// 	obj:null,
			// },
		};
		console.log('NeuralEditor.constructor');
		this.cnv = {
			ref:null,
			obj:null,
		};

	}

	printNetwork(){
		this.neural.render.run(this.cnv.obj);
	}

	handleGetCanvas(ref,obj){
		this.cnv.ref=ref;
		this.cnv.obj=obj;
		this.neural = new AreaTest(this.cnv.obj);//Network
	}

	handleClickLoad(){
		this.neural.load();
		this.setState({neural:this.neural});
		this.printNetwork();
	}

	handleClickPaint(){
		this.printNetwork();
	}

	handleMouse(event){
		let x=event.offsetX;
		let y=event.offsetY;
		//event.altKey, event.ctrlKey, event.shiftKey
		switch (event.type) {
			case 'mousedown':
				break;
			case 'mousemove':
				break;
			case 'mouseup':
				break;
			default:
				break;
		};
	}

	render(){
		return (
			<div>
				<h1>Neural Editor</h1>
				<div>
					<button
						onClick={this.handleClickLoad.bind(this)}
					>load</button>
					<button
						onClick={this.handleClickPaint.bind(this)}
					>paint</button>
				</div>
				<Screen
					rect={this.state.rect}
					getCanvas={this.handleGetCanvas.bind(this)}
					onMouse={this.handleMouse.bind(this)}
				></Screen>
				{(this.state.neural) &&
				<NetworkTree
					neural={this.state.neural}
					network={this.state.neural.network}
					printNetwork={this.printNetwork.bind(this)}
				></NetworkTree>
				}
			</div>
		);
//
	};
}

export default NeuralEditor;
