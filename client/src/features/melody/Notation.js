import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Note from './Note.js'
import styles from './note.css';


class Notation extends React.Component{
	constructor(props){
		super(props);
		this.state={
		};
		this.lines = [1,2,3,4,5];
	}

	componentDidMount(){
	}

	componentWilUnmount(){
	}

	render(){
		return (
			<div
				className="notation"
			>
				{this.lines.map((line,index)=>
					<div
						className="line"
						key={'line_'+index}
						style={{top:61+index*10}}
					></div>
				)}
				{this.props.notes.map((note,index)=>
					<Note
						id={index}
						key={'note_'+index}
						note={note}
						setTone={this.props.setTone}
						editor={this.props.editor}
					></Note>
				)}
			</div>
		);
	};

}

export default Notation;
