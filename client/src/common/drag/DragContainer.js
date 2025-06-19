import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'


import drag from './Drag.js'//for Container1

import Block from './Block.js'
import Container from './Container.js'

class DragContainer extends React.Component{
	constructor(props){
		super(props);
		//drag
		//rect
		this.state={
			//dragVisible:true,
			//first coords of draggedBlock:
			draggedRect:{
				left:0,
				top:0,
			},
			//dragLeft:0,
			//dragTop:0,
		};

		this.drag2={...this.props.drag};//для ползунка

		this.drag=this.props.drag;//{...this.props.drag};
		this.drag.beforeReplace=this.beforeReplace.bind(this);
		this.drag.onReplace=this.onReplace.bind(this);
		this.drag.afterReplace=this.afterReplace.bind(this);

	}



	beforeReplace(event, row){//==drag.onReplace
		//start
		//
		//console.log(event, row);
//!!!!!!!!!!!!!!!1



		if(event.buttons>0){//0-none, 1-left, 2-right,
			if(!this.state.dragVisible){
				//console.log('dragVisible');

					console.log(event);
					console.log('event.nativeEvent.screen X Y',event.nativeEvent.screenX,event.nativeEvent.screenY);

					let rect={
						 left:event.clientX+window.scrollX      - 10,
						 top:event.clientY+window.scrollY  -100  - 10,//-100?
						// left:event.nativeEvent.screenX+10,
						// top:event.nativeEvent.screenY+10,
						// left:event.nativeEvent.offsetX-30,
						// top:event.nativeEvent.offsetY-10,
					};
					//this.drag2.draggedBlock.setState(rect);
					this.setState({draggedRect:rect});


				//if(!this.drag2.obj){
					this.drag2.obj=row;
				//};

				this.setState({dragVisible:true});
				this.setState({dragCaption:row.name});//'Capt'

			}
			else{

				if(this.state.draggedBlock){//if(this.drag2.draggedBlock){
					if(!this.drag2.drag.tag)
					this.drag2.startDrag(event, this.state.draggedBlock);//this.drag2.startDrag(event, this.drag2.draggedBlock);
				};
			};

		};
	}

	afterReplace(event){
		//
	}


	handleGetBlock(block){
		console.log('block',block);
		this.setState({draggedBlock:block});//this.drag2.draggedBlock=block;

	}

	onReplace(event){//drag
		if(event.buttons>0){//0-none, 1-left, 2-right,
		}
		else{
			//end of drop
			//
			this.drag2.obj=null;
			this.setState({dragVisible:false});
		};
	}



	render(){
		return (

				<Container
					drag={this.props.drag}
					rect={this.props.rect}
				>
					{this.props.children}
					{(this.state.dragVisible) && 
					<Block
						drag={this.drag2}
						rect={this.state.draggedRect}
						caption={this.state.dragCaption}
						getBlock={this.handleGetBlock.bind(this)}
					/>}
				</Container>
		)
	}
}

export default DragContainer;
