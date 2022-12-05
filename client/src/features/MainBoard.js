import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

class MainBoard extends React.Component{
	constructor(props){
		super(props);
		this.state={
			//
		};
	}

	componentDidMount(){
	}

	handleClickMode(name){
		this.props.client.setState({mode:name});
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<div>
				<button
					onClick={ ((e)=>{this.handleClickMode('ScenarioEditor'); }) }
				>ScenarioEditor</button>
				<button
					onClick={ ((e)=>{this.handleClickMode('BezierEditor'); }) }
				>BezierEditor</button>
				<button
					onClick={ ((e)=>{this.handleClickMode('MelodyEditor'); }) }
				>MelodyEditor</button>
			</div>
		);
	};

}

export default MainBoard;
