import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';


import styles from './editor.css'

class Editor extends React.Component{
	constructor(props){
		super(props);
		//client
		//caption
		this.state={
		};
		//console.log(this.props.caption,'editor.constructor');
	}

	componentDidMount(){
	}

	handleClickExit(event){
		this.props.client.handleMode('MainBoard');
	}

	getClass(){
		let className = 'editor';
		return className;
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<div
				className={this.getClass()}
			>
				<h1>{this.props.caption}</h1>
				<nav>
					<button
						onClick={this.handleClickExit.bind(this)}
					>Exit</button>
				</nav>
				{this.props.children}
			</div>
		);
	};
};

export { Editor };
