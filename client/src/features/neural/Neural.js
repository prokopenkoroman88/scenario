
const configurator = {

	discriminants : {
		_common(func){
			//this = Neuron
			let last_layer=this.layer.last;
			let input_neurons = this.layer.last.neurons;
			this.value=this.weightC.value;
			//console.log('discriminant_sum', input_neurons, this);
			this.weights.forEach((weight, iWeight)=>{
				func(input_neurons[iWeight].value, weight.value);
			}, this);
		},
		_posit(){
			if(this.value<0)
				this.value=0;
		},
		sum(){
			configurator.discriminants._common.bind(this)((input,weight)=>{
				this.value += input * weight;
			});
		},
		sum_abs(){
			configurator.discriminants._common.bind(this)((input,weight)=>{
				this.value += input * weight;
			});
			configurator.discriminants._posit.bind(this)();
		},
		center(){
			configurator.discriminants._common.bind(this)((input,weight)=>{
				this.value += Math.pow(input - weight, 2);
			});
		},
		max(){
			configurator.discriminants._common.bind(this)((input,weight)=>{
				this.value = Math.max(this.value, input*weight);
			});
		},
		min(){
			configurator.discriminants._common.bind(this)((input,weight)=>{
				this.value = Math.min(this.value, input*weight);
			});
		},
	},

	activations : {
		'identity': x => {return x},//-infinity..+infinity /
		'step' : x => {return x>0?1:0},//0..1 _|`
		'sigmoid' : x => {return 1/(1+Math.exp(-x))},//0..1 _/`
		'tanh' : x => {return(Math.exp(x)-Math.exp(-x))/(Math.exp(x)+Math.exp(-x))},//-1..1 _/`
		'atan' : x => {return Math.atan(x)},//-PI/2..+PI/2  _/`
		'softsign' : x => {return x/(1+Math.abs(x))},//-1..1 _/'
		'gaussian': x => {return Math.exp(-x*x)},//0..1 _/^\_
	},

	supply(neuron, discrimination='sum', activation='sigmoid'){
		//оснащення нейрона функціями дискримінанта та активації
		neuron.discriminant=this.discriminants[discrimination].bind(neuron);
		neuron.activation=this.activations[activation].bind(neuron);
	},

};


class Weight{
	constructor(neuron, name='', value=0){
		this.neuron=neuron;
		this.input_neuron=this.neuron.input_neuron(name);//layer.last.neuron
		this.value=value;
	}
}


class Neuron{
	constructor(layer, name=''){
		this.layer=layer;
		this.name=name;
		this.weightC=0;
		this.weights=[];
		this.value=0;
	}

	input_neuron(index){
		let last_layer = this.layer.last
		if(typeof index =='string')
			return last_layer.neuron(index);
		if(typeof index =='number')
			return last_layer.neurons[index];
	}

	input(index){
		return this.input_neuron(index).output;
		//return this.weight(index).input_neuron.output;
	}

	get output(){ return this.value; }

	weight(name){
		if(!name)
			return this.weightC;
		let last_layer = this.layer.last;
		if(!last_layer)
			return;
		let index = last_layer.neuronIndex(name);
		if(index>=0)
			return this.weights[index];
	}

	discriminant(){
		this.value=0;
	}

	activation(x){
		return x;
	}

	activate(){
		this.discriminant();
		this.value = this.activation(this.value);
		return this.value;
	}

};


class Layer{
	constructor(network, name=''){
		this.network=network;
		this.name=name;
		this.default = {
			neuron_name:'neuron',
			discriminant:'sum',
			activation:'sigmoid',
		};
		this.neurons=[];
	}

	neuronIndex(name){
		for(let i=0; i<this.neurons.length; i++)
			if(this.neurons[i].name==name)
				return i;
		return -1;
	}

	neuron(name){
		let index=this.neuronIndex(name);
		if(index>=0)
			return this.neurons[index];
	}

};


class Network{
	constructor(name=''){
		this.name=name
		this.layers=[];
	}

	layerIndex(name){
		for(let i=0; i<this.layers.length; i++)
			if(this.layers[i].name==name)
				return i;
		return -1;
	}

	layer(name){
		let index=this.layerIndex(name);
		if(index>=0)
				return this.layers[index];
	}

	recognize(inputs){
		this.layers.forEach((layer, iLayer)=>{
			if(iLayer==0)
				layer.neurons.forEach((neuron, iNeuron)=>{neuron.value=inputs[iNeuron];});
			else
				layer.neurons.forEach((neuron, iNeuron)=>{neuron.activate();});
		}, this);
	}

}


class Editor{
	constructor(network=null){
		this.configurator = configurator;
		this.curr={
			network:network,
			layer:null,
			neuron:null,
			weight:null,
		};
		this.last_layer=null;
	}

	addNetwork(){
		this.curr.network = new Network();
	}

	addLayer(name){
		this.curr.layer = new Layer(this.curr.network, name);
		this.curr.network.layers.push(this.curr.layer);
	}

	linkLayers(){
		if(this.last_layer){
			this.last_layer.next=this.curr.layer;
			this.curr.layer.last=this.last_layer;
		};
		this.last_layer=this.curr.layer;
	}

	editLayer(neuron_name='neuron', discriminant='sum', activation='sigmoid'){
		this.curr.layer.default.neuron_name=neuron_name;
		this.curr.layer.default.discriminant=discriminant;
		this.curr.layer.default.activation=activation;
	}

	selectLayer(name){
		this.curr.layer = this.curr.network.layer(name);
	}

	addLayerEx(layer_name='', neuron_name='neuron', discriminant='sum', activation='sigmoid'){
		this.addLayer(layer_name);
		this.linkLayers();
		this.editLayer(neuron_name, discriminant, activation);
	}

	addNeuron(name, neuronClass=Neuron){
		this.curr.neuron = new neuronClass(this.curr.layer, name);
		this.curr.layer.neurons.push(this.curr.neuron);
	}

	editNeuron(discriminant='sum', activation='sigmoid'){
		this.configurator.supply(this.curr.neuron, discriminant, activation);
	}

	selectNeuron(name){
		this.curr.neuron = this.curr.layer.neuron(name);
	}

	addNeuronEx(layer_name='',neuron_name='',weightC,weights){
		if(layer_name)
			this.selectLayer(layer_name);
		let layer = this.curr.layer;
		if(!neuron_name)
			neuron_name=layer.default.neuron_name+(layer.neurons.length+1);
		this.addNeuron(neuron_name);
		this.editNeuron(layer.default.discriminant, layer.default.activation);
		this.addWeights(weightC, weights);
	}

	linkNeuron(){
		//додати weights у кількості нейронів попереднього шару
		let weightC=0;
		let cntWeights = this.curr.layer.last.neurons.length;
		let weights = new Array(cntWeights);
		for(let i=0; i<cntWeights; i++)
			weights[i]=0;
		this.addWeights(weightC, weights);
		//додати по одному weight кожному нейрону наступного шару
		let next_layer = this.curr.layer.next;
		if(next_layer){
			next_layer.neurons.forEach((next_neuron,iNeuron)=>{
				let weight = new Weight(next_neuron,this.curr.neuron.name,0);
				next_neuron.weights.push(weight);
			}, this);
		};
	}

	addWeights(weightC,weights){
		this.curr.neuron.weightC = new Weight(this.curr.neuron,'',weightC);
		this.curr.neuron.weights = weights.map((weight,iWeight)=>{
			return new Weight(this.curr.neuron, iWeight, weight);
		}, this);
	}

	select(level,element){
		const a = ['network','layer','neuron','weight'];
		a.forEach((level)=>{
			this.curr[level]=null;
		}, this);

		while (level>=0) {
			this.curr[ a[level] ] = element;
			level--;
			if(level>=0)
				element = element[ a[level] ];
		};
	}

}


class Neural{
	constructor(){
		this.network = new Network();
		this.editor = new Editor(this.network);
	}
}

export { Neural };
