import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

import styles from './styles.css'

class ButtonPanel extends React.Component{
	constructor(props){
		super(props);
		//btns
		//className
		this.state={
			btns:this.prepareButtons(),
		};
//		this.drag=drag;
	}

	prepareButtons(){
		let btns = this.props.btns;
		if(!Array.isArray(btns)){
			//if props.btns is an object like {'capt1':onClick1, 'capt2':onClick2, }
			let captions = Object.getOwnPropertyNames(btns);
			btns = captions.map((caption)=>{
				return {
					caption,
					onClick:btns[caption]
				}
			},this)//
		}
		return btns;
	}

	getClass(){
		let className='panel';
		if(this.props.className)
			className+=' '+this.props.className;
		return className;
	}


	componentDidMount(){}

	render(){
//!		let btns=this.state.btns;
		let btns=this.prepareButtons();
		return(
			<div
				className={this.getClass()}
			>
			{(btns) && btns.map((btn,id)=>
				<button
					key={'btn_'+id}
					onClick={btn.onClick}
					className={btn.className}
				>{btn.caption}</button>
			)}
			</div>
		)
	}

}

export default ButtonPanel;
