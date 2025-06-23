import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

import styles from './menu.css'

export default class MenuPanel extends React.Component{
	constructor(props){
		super(props);
		//menu
		//className
		this.state={
		};
	}


	renderItem(item, index){
		return (
			<li key={index}>
				<span
					onMouseDown={item.onClick}
				>{item.caption}</span>
				{this.renderList(item.children)}
			</li>
		)
	}

	renderList(list, className=''){
		if(!list || !list.length)
			return null;
		return (
			<ul
				className={className}
			>
			{list.map((item, index)=>
				this.renderItem(item, index)
			)}
			</ul>
		)
	}

	render(){
		//console.log('MenuPanel', this.props.menu);
		return this.renderList(this.props.menu ,'menu');
	}

}
