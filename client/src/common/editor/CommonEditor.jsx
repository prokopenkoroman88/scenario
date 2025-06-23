import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import Caption from './../drag/Caption.js'
import ButtonPanel from './ButtonPanel.js'
import MenuPanel from './MenuPanel.jsx'

import styles from './styles.css'

export default class CommonEditor extends React.Component{

	constructor(props){
		super(props);
		//editor
		//caption
		this.state={
	//?		btns:props.btns,
			rect:{
				left:0,
				top:0,
			},
		};
		this.props.editor.setComponent(this);
	}


	componentDidMount(){
	}

	componentWilUnmount(){
	}

	renderMenu(menu, className=''){
		//console.log('menu', menu);
		if(!menu ||!menu.length)
			return null;
		return (
			<MenuPanel
				menu={menu}
				className={className}
			/>
		)
	}

	renderButtonPanel(btns, className=''){
		if(!btns || !btns.length)
			return null;
		return (
			<ButtonPanel
				btns={btns}
				className={className}
			/>
		)
	}

	renderStatusBar(){
		return null;
	}

	render(){
		let editor=this.props.editor;
		let css=editor.getCSS();


		if(!this.props.editor.component)
			this.props.editor.setComponent(this);

		editor.beforeRender();//after setComponent

		//console.log(editor.constructor.name, this.props.caption, 'render');
		return (
			<section
				className={css.className}
				style={css.styles} 
			>
				<Caption
					block={this}
					drag={editor.drag}
					level={css.level}
				>{this.props.caption}</Caption>
				{this.renderMenu(editor.mainMenu)}
				{this.renderButtonPanel(editor.topButtons)}
				<div className='main-with-asides'>
					{this.renderButtonPanel(editor.leftButtons, 'vert left')}
					<div className='main'>
						{editor.renderMain()}
					</div>
					{this.renderButtonPanel(editor.rightButtons, 'vert right')}
				</div>
				{this.renderStatusBar()}
			</section>
		);
	}

}
