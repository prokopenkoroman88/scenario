import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

import Block from './../common/Block.js'
import Container from './../common/Container.js'
import Form from './Form.js'
import Grid from './Grid.js'


class VocGrid extends React.Component{
	constructor(props){
		super(props);
		//drag
		//loader
		//scheme
		this.state={
			rows:[],
			formVisible:false,
			current_id:-1,
			rect:{left:Math.round(20+Math.random()*500), top:Math.round(200+Math.random()*500)  },
		};

		this.loadListScheme();
		this.refresh();
	}

	loadListScheme(){
		this.scheme={
			defValues:{
			},
			caption:'',
			columns:[
			],
			fields:[
			],
		};

		this.gridScheme={
			caption: '',
			columns: [],
		};

		this.props.loader.listScheme(((scheme)=>{
			this.scheme.caption=scheme.caption;
			this.scheme.columns=scheme.columns;

			this.gridScheme={
				caption: '',
				columns: this.scheme.columns,
			};

			//scheme from props:
			if(this.props.scheme){
				if(this.props.scheme.caption)
					this.scheme.caption=this.props.scheme.caption;
				if(this.props.scheme.columns && this.props.scheme.columns.length)
					this.gridScheme.columns=this.props.scheme.columns;
			};
		}).bind(this));
	}

	componentDidMount(){}


	openForm(){
		//Open the form by id in this.state.current_id
		this.setState({formVisible:true});
	}

	closeForm(){
		this.setState({formVisible:false});
	}

	refresh(force=false){
		this.props.loader.getAll(((rows)=>{
			this.setState({rows});
		}).bind(this));
	}

	choice(id){
		this.setState({current_id: id});
	}

	del(id){
		this.props.loader.del(id, ((res)=>{
			//console.log(`Deleted ${res.affectedRows} rows`);
			this.handleSetCurrentId();
		}).bind(this));
	}

	openObj(){
		this.formScheme={
			caption: '',//this.scheme.caption,//?
			fields: [],
			defValues: {},
		};

		this.props.loader.init(((obj)=>{
			this.formScheme.defValues=obj;
			this.openForm();
		}).bind(this));
	}

	add(){
		this.openObj();
	}

	edit(){
		//loading of obj is in Form.js
		this.openObj();
	}

	//handles:

	handleRefresh(event){//button Refresh
		this.refresh();
	}

	handleAdd(event){//button New
		this.choice(-1);
		this.add();
	}

	handleEdit(event){//button Edit
		this.edit(this.state.current_id);
	}

	handleDel(event){//button Del
		this.del(this.state.current_id);
	}


	handleDoubleClick(id){
		this.choice(id);
		this.handleEdit();
	}

	handleSetCurrentId(id=-1, bNew=false){
		this.choice(id);
		this.refresh();
	}

	handleCloseForm(last_id=-1){
		this.closeForm();
	}

	componentWilUnmount(){}

	getCSS(){
		return {
			className:'oval',
			styles:{
				backgroundColor:'lightgray',
				border:'2px outset gray',
			},
			level:3,
		};
	}

	render(){
		return (
			<Block
				caption={this.scheme.caption}
				css={this.getCSS()}
				rect={this.state.rect}
				drag={this.props.drag}
			>
				<div>
					<button
						onClick={this.handleRefresh.bind(this)}
					>F5</button>
					<button
						onClick={this.handleAdd.bind(this)}
					>+</button>
					<button
						onClick={this.handleEdit.bind(this)}
					>~</button>
					<button
						onClick={this.handleDel.bind(this)}
					>-</button>
				</div>
			{(this.state.formVisible) &&
				<Form
					drag={this.props.drag}
					loader={this.props.loader}
					id={this.state.current_id}
					scheme={this.formScheme}
					onClose={this.handleCloseForm.bind(this)}
					setCurrentId={this.handleSetCurrentId.bind(this)}
				></Form>
			}
				<Grid
					scheme={this.gridScheme}
					rows={this.state.rows}
					current_id={this.state.current_id}
					onClick={this.choice.bind(this)}
					onDoubleClick={this.handleDoubleClick.bind(this)}
				></Grid>
			</Block>
		);////
	};

}

export default VocGrid;
