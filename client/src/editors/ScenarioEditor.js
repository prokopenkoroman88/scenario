import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from './Editor.js';

class ScenarioEditor extends React.Component{
	constructor(props){
		super(props);
		this.state={
		};
	}

	componentDidMount(){
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<Editor
				client={this.props.client}
				caption='Scenario editor'
			>
			</Editor>
		);
	};
};

export default ScenarioEditor;
