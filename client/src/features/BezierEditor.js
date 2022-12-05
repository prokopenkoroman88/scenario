import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

class BezierEditor extends React.Component{
	constructor(props){
		super(props);
		this.state={
		};
		console.log('BezierEditor.constructor');
	}

	componentDidMount(){
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<div>Bezier Editor
			</div>
		);
	};
}

export default BezierEditor;
