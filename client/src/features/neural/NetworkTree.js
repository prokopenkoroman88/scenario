import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Neural } from './Neural.js';
import styles from './NetworkTree.css';


class WeightBranch extends React.Component{
	constructor(props){
		super(props);
		this.state={
			weight:props.weight,
		};
	}

	handleInput(event){//event
		let value = +event.target.value;
		let weight = this.state.weight;
		weight.value = value;
		this.setState({ weight : weight });
		this.props.printNetwork();
	}

	getClassName(){
		let res='weight';
		if(this.props.neural.editor.curr.weight==this.state.weight)
			res+=' active';
		return res;
	}

	render(){
		return (
			<li
				onClick={()=>{this.props.handleSelect(3,this.state.weight);}}
				className={this.getClassName()}
			>
				<input
					type="number"
					value={this.state.weight.value}
					onChange={(event)=>{this.handleInput.bind(this)(event); }  }
				/>
			</li>
		)//
	}
}


class NeuronBranch extends React.Component{
	constructor(props){
		super(props);
		this.state={
			neuron:props.neuron,
		};
	}

	getClassName(){
		let res='neuron';
		if(this.props.neural.editor.curr.neuron==this.state.neuron)
			res+=' active';
		return res;
	}

	render(){
		return (
			<li className={this.getClassName()}
				onClick={()=>{this.props.handleSelect(2,this.state.neuron);}}
			>{this.state.neuron.name}
				{this.props.children}
			</li>
		);//
	};
}


class LayerBranch extends React.Component{
	constructor(props){
		super(props);
		this.state={
			layer:props.layer,
		};
	}

	getClassName(){
		let res='layer';
		if(this.props.neural.editor.curr.layer==this.state.layer)
			res+=' active';
		return res;
	}

	render(){
		return (
			<li
				className={this.getClassName()}
				onClick={()=>{this.props.handleSelect(1,this.state.layer);}}
			>{this.state.layer.name}
				{this.props.children}
			</li>
		);//
	};
}


class NetworkTree extends React.Component{
	constructor(props){
		super(props);
		this.state={
			neural:props.neural,
			network:props.network,
		};
		console.log('NetworkTree.constructor');
		this.clicked=0;
	}

	handleSelect(level,element){
		if(this.clicked>0)
			return;//виконуються кілька разів від ваги до мережі
		this.clicked++;
		let neural = this.state.neural;	
		neural.editor.select(level,element);

		if(level==2){
			//для зображення нейрона
			neural.render.neuron=neural.editor.curr.neuron;
			this.props.printNetwork();
		};

		console.log('handleSelect', neural.editor.curr);
		this.setState({ neural : neural });
	}

	handleAddLayer(){
		let network = this.state.network;
		let neural = this.state.neural;
		let name = 'layer'+(network.layers.length+1);
		neural.editor.addLayer(name);
		neural.editor.linkLayers();
		this.setState({ network : network });
	}

	handleAddNeuron(layer){
		let network = this.state.network;
		let neural = this.state.neural;
		let name = 'neuron'+(neural.editor.curr.layer.neurons.length+1);
		neural.editor.addNeuron(name);
		neural.editor.editNeuron();
		neural.editor.linkNeuron();
		this.setState({ network : network });
	}

	render(){
		let layers=[];
		if(this.state.network && this.state.network.layers && this.state.network.layers.length>0)
			layers=this.state.network.layers;
		return (
			<div
				className='network'
				onMouseDown={()=>{  this.clicked=0;  }}
				onClick={()=>{this.handleSelect(0,this.state.network);}}
			>
				<h1>Network</h1>
				<ul>
				{(layers.length>0) && layers.map((layer,index)=>(
					<LayerBranch
						key={index} 
						layer={layer}
						neural={this.state.neural}
						handleSelect={this.handleSelect.bind(this)}
					>
						<ul>
						{(layer.neurons.length>0) && layer.neurons.map((neuron,index)=>(
							<NeuronBranch
								key={index}
								neuron={neuron}
								neural={this.state.neural}
								handleSelect={this.handleSelect.bind(this)}
							>
								<ul>
									<WeightBranch
										neuron={neuron}
										neural={this.state.neural}
										weight={neuron.weightC}
										printNetwork={this.props.printNetwork}
										handleSelect={this.handleSelect.bind(this)}
									/>
								{(neuron.weights.length>0) && neuron.weights.map((weight,index)=>(
									<WeightBranch
										key={index}
										neuron={neuron}
										neural={this.state.neural}
										weight={weight}
										printNetwork={this.props.printNetwork}
										handleSelect={this.handleSelect.bind(this)}
									/>
								))}
								</ul>
							</NeuronBranch>
						))}
						{(this.state.neural.editor.curr.layer==layer) &&
							<li className='neuron'>
								<button
									onClick={()=>{this.handleAddNeuron.bind(this)(layer)}  }
								>New Neuron</button>
							</li>
						}
						</ul>
					</LayerBranch>
				))}
				{(this.state.neural.editor.curr.network==this.state.network) &&
					<li className='layer'>
						<button
							onClick={this.handleAddLayer.bind(this)}
						>New Layer</button>
					</li>
				}
				</ul>
			</div>
		);//
	};
}

export default NetworkTree;
