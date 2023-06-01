import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import Block from './../common/Block.js'
import Container from './../common/Container.js'
import { ResourceLoader } from './../http/Loader.js'

import styles from './form.css';

class Field extends React.Component{
	constructor(props){
		super(props);
		//field:
		//  type
		//  name
		//  caption
		//  classList
		//
		//obj
		//onChange
		this.state={
			rows:[],
		};
		this.type = this.props.field.type;
		this.name = this.props.field.name;

		if(this.type=='select'){
			this.loader = this.props.field.loader;//new ResourceLoader(tableName);
			this.load();
		};
	}

	componentDidMount(){
	}

	load(){
		//for select
		this.loader.getAll(((rows)=>{
			this.setState({rows});
		}).bind(this));
	}

	render(){
		switch (this.type) {
			case 'select':
				let name='name';
				let rows=this.state.rows;
				return (
					<select
						name={this.name}
						value={this.props.obj[this.name]}
						onChange={(event)=>{this.props.onChange(event,this.props.field)}}
					>
						<option
							value={0}
						>Не выбран</option>
					{(rows) && rows.map((row,id)=>
						<option
							key={'option_'+id}
							value={row.id}
						>{row[name]}</option>
					)}
					</select>
				);//
			default://text number
				return (
					<input
						type={this.type}
						name={this.name}
						value={this.props.obj[this.name]}
						onChange={(event)=>{this.props.onChange(event,this.props.field)}}
					/>
				);//
		}
	}
};


class Form extends React.Component{
	constructor(props){
		super(props);
		//loader
		//id
		//scheme:{ caption, fields }
		//onClose
		//setCurrentId
		this.state={
			id:props.id,
			obj:props.scheme.defValues,
			rect:{left:10, top:10},
		};

		this.loadFormScheme();
		this.insertId=this.props.id;
		this.refresh(true);
	}


	loadFormScheme(){
		this.formScheme={
			caption: '',
			fields: [],
		};

		this.props.loader.formScheme(((scheme)=>{
			this.formScheme.caption=scheme.caption;
			this.formScheme.fields=scheme.fields;

			this.formScheme.fields.forEach((field)=>{
				if(field.tableName && !field.loader){
					field.loader = new ResourceLoader(field.tableName);
				}
			}, this);

			//scheme from props:
			if(this.props.scheme){
				if(this.props.scheme.caption)
					this.formScheme.caption=this.props.scheme.caption;
				if(this.props.scheme.fields && this.props.scheme.fields.length)
					this.formScheme.fields=this.props.scheme.fields;
			};
		}).bind(this));
	}

	componentDidMount(){
	}


	refresh(bFirst=false){
		this.props.loader.byId(this.state.id, ((obj)=>{
			this.setState({obj});
			if(bFirst){
				this.props.scheme.defValues=obj;
			};
		}).bind(this));
	}


	add(){
		this.props.loader.add(this.state.obj, ((res)=>{
			this.insertId=res.insertId;
			this.setState({id:res.insertId});
			this.props.setCurrentId(this.insertId, true);
		}).bind(this));
	};

	edit(){
		this.props.loader.edit(this.props.id, this.state.obj, ((res)=>{
			this.props.setCurrentId(this.props.id);
		}).bind(this));
	};


	close(){
		this.props.onClose(this.insertId);
	}

	handleFieldChange(event, field){//for CustomField
		let value = event.target.value;
		this.setState(
			prevState=>({
				obj: { ...prevState.obj, [field.name]: value}
			})
		);
	}

	handleOK(event){
		if(this.props.id>0)
			this.edit();
		else
			this.add();
		this.close();
	}

	handleCancel(event){
		this.close();
	}

	render(){
		return (
			<Block
				caption={this.formScheme.caption}
				css={{
					className:'oval',
					styles:{
						backgroundColor:'yellow',
						border:'1px outset red',
					},
					level:3,
				}}
				rect={this.state.rect}
				drag={this.props.drag}
				block={this}
				container={this.props.container}
			>
				<div>
				{(this.formScheme.fields) && this.formScheme.fields.map((field,id)=>
					<Field
						key={'field_'+id}
						field={field}
						obj={this.state.obj}
						onChange={this.handleFieldChange.bind(this)}
					></Field>
				)}
				</div>
				<div>
					<button
						onClick={this.handleOK.bind(this)}
					>OK</button>
					<button
						onClick={this.handleCancel.bind(this)}
					>Cancel</button>
				</div>
			</Block>
		);
	}//

};

export default Form;
