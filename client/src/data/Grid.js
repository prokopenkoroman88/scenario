import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

import styles from './grid.css'

class Grid extends React.Component{
	constructor(props){
		super(props);
		//scheme: { caption, columns }
		//rows
		//current_id
		//onClick
		//onDoubleClick
		this.state={
		};
	}

	onClick(id){
		if(this.props.onClick)
			this.props.onClick(id);
	}

	onDoubleClick(id){
		if(this.props.onDoubleClick)
			this.props.onDoubleClick(id);
	}

	getClass(){
		let className = 'grid';
		if(!this.props.children)
			className+=' empty';
		return className;
	}

	getStyle(){
		return {
		};
	}

	getRowClass(id){
		if(id==this.props.current_id)
			return 'selected';
	}

	render(){
		return (
			<table
				className={this.getClass()}
				style={this.getStyle()}
			>
				{(this.props.scheme.caption) &&
					<caption>{this.props.scheme.caption}</caption>
				}
				<thead>
				{(this.props.scheme.columns) &&
					<tr>
					{this.props.scheme.columns.map((column,id)=>
						<th
							key={'col_'+id}
						>{column.caption}</th>
					)}
					</tr>
				}
				</thead>
				{(this.props.rows) &&
				<tbody>
				{this.props.rows.map((row,id)=>
					<tr
						key={'row_'+id}
						className={  this.getRowClass(row.id)  }
						onClick={ (()=>{ this.onClick(row.id) }).bind(this) }
						onDoubleClick={ (()=>{ this.onDoubleClick(row.id) }).bind(this) }
					>
					{(this.props.scheme.columns) && this.props.scheme.columns.map((column,id)=>
						<td
							key={'cell_'+id}
						>{row[column.name]}</td>
					)}
					</tr>
				)}
				</tbody>
				}
				<tfoot>
				</tfoot>
			</table>
		);
	}

};

export default Grid;
