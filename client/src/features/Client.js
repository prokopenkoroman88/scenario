import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import MainBoard from './MainBoard.js'
import ScenarioEditor from './ScenarioEditor.js'
import BezierEditor from './BezierEditor.js'
import MelodyEditor from './MelodyEditor.js'

class Client extends React.Component{
	constructor(props){
		super(props);
		this.state={
			mode:'MainBoard',//MainBoard,ScenarioEditor,BezierEditor,MelodyEditor,
		};
	}

	componentDidMount(){
	}

	handleMode(name){
		this.setState({mode:name});
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<div className='client'>
				{(this.state.mode=='MainBoard') &&
					<MainBoard
						client={this}
						handleMode={this.handleMode.bind(this)}
					>
					</MainBoard>
				}
				{(this.state.mode=='ScenarioEditor') &&
					<ScenarioEditor
						client={this}
					>
					</ScenarioEditor>
				}
				{(this.state.mode=='BezierEditor') &&
					<BezierEditor
						client={this}
					>
					</BezierEditor>
				}
				{(this.state.mode=='MelodyEditor') &&
					<MelodyEditor
						client={this}
					>
					</MelodyEditor>
				}
			</div>
		);
	};
};

export default Client;
