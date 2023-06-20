import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import { CustomEditor } from './../common/CustomEditor.js'

import styles from './editor.css'

class Editor extends React.Component{
	constructor(props){
		super(props);
		//client
		//caption
		//css
		//btns {top, left, right}
		this.state={
			//btns:props.btns,
		};
		this.prepareCSS();
		this.prepareBtns();
		//console.log(this.props.caption,'editor.constructor');
	}

	prepareCSS(){
		this.css=this.props.css;
		if(!this.css)
			this.css={};
		if(!this.css.level)
			this.css.level=1;
		if(!this.css.className)
			this.css.className='editor';
	}

	addBtn(btns, caption, onClick){
		if(Array.isArray(btns))
			btns.push({caption,onClick,});
		else
			btns[caption]=onClick;
	}

	prepareBtns(){
		this.btns=this.props.btns;
		let topBtns=this.btns.top;
		if(!topBtns){
			topBtns=[];//{};
			this.btns.top=topBtns;
		};
		this.addBtn(topBtns,'Exit',this.handleClickExit.bind(this));
	}

	componentDidMount(){
	}

	handleClickExit(event){
		this.props.client.handleMode('MainBoard');
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<CustomEditor
				caption={this.props.caption}
				css={this.css}
				btns={this.btns}
			>
				{this.props.children}
			</CustomEditor>
		);
	};
};
////


/*

			<CustomEditor
				caption={this.props.caption}
				css={css}
				btns={this.props.btns}
			>
				<nav>
					<button
						onClick={this.handleClickExit.bind(this)}
					>Exit</button>
				</nav>
				{this.props.children}
			</CustomEditor>






//console.log('this.props.btns',this.props.btns);
//console.log('this.state.btns',this.state.btns);
		let topBtns, leftBtns, rightBtns;
		if(this.props.btns){
			topBtns=this.props.btns.top;
			leftBtns=this.props.btns.left;
			rightBtns=this.props.btns.right;
		};


			<div
				className={this.getClass()}
			>
				<h1>{this.props.caption}</h1>
				<nav>
					<button
						onClick={this.handleClickExit.bind(this)}
					>Exit</button>
				</nav>
			{(topBtns) &&
				<ButtonPanel
					btns={topBtns}
				/>
			}
				<div className='main-with-asides'>
				{(leftBtns) &&
					<ButtonPanel
						btns={leftBtns}
						className='vert'
					/>
				}
					{this.props.children}
				{(rightBtns) &&
					<ButtonPanel
						btns={rightBtns}
						className='vert'
					/>
				}
				</div>
			</div>
*/



export { Editor };
