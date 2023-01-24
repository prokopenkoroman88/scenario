import { Neural } from './Neural.js';

class Render{
	constructor(network,canvas=null){
		this.network=network;
		this.canvas=canvas;
		if(this.canvas)
			this.rect={
				left:0,
				top:0,
				right:this.canvas.width-1,
				bottom:this.canvas.height-1,
			}
		else
			this.rect={
				left:0,
				top:0,
				right:0,
				bottom:0,
			};
		this.scale=1;
	}

	run_point(inputs){
		this.network.recognize(inputs);
		//показники нейронів останнього шару
		let r=Math.round(this.output.r.value*255);
		let g=Math.round(this.output.g.value*255);
		let b=Math.round(this.output.b.value*255);
		let rgba=[r,g,b,255];
		return rgba;
	}

	run(canvas=null){
		if(canvas)
			this.canvas=canvas;

		let w=this.rect.right-this.rect.left+1;
		let h=this.rect.bottom-this.rect.top+1;

		for(let y=this.rect.top; y<=this.rect.bottom; y++){
			for(let x=this.rect.left; x<=this.rect.right; x++){
				let rgba = this.run_point([x/w*this.scale-this.scale/2, y/h*this.scale-this.scale/2]);
				if(this.neuron){
					let value = Math.round(this.neuron.value*255);
					rgba[0] = Math.round(((rgba[0] + value)/2));
					rgba[1] = Math.round(((rgba[1] + value)/2));
					rgba[2] = Math.round(((rgba[2] + value)/2));
				};
				this.canvas.setRGB(x,y,rgba);	
			};//x
		};//y
		this.canvas.put();
	}

}


class AreaNetwork extends Neural{
	constructor(canvas){
		super();
		this.render = new Render(this.network, canvas);
	}

	init(){
		this.editor.addLayerEx('input');
		this.editor.addNeuron('x');
		this.editor.addNeuron('y');

		this.editor.addLayerEx('lines','line');

		this.editor.addLayerEx('clasters','claster','sum_abs','sigmoid');

		this.editor.addLayerEx('output');
		this.editor.addNeuron('r');
		this.editor.editNeuron();
		this.editor.addNeuron('g');
		this.editor.editNeuron();
		this.editor.addNeuron('b');
		this.editor.editNeuron();

		this.render.output={//нейрони останнього шару
			r:this.editor.curr.layer.neuron('r'),
			g:this.editor.curr.layer.neuron('g'),
			b:this.editor.curr.layer.neuron('b'),
		};
	}

	addLine(name,weightC,weights){
		this.editor.addNeuronEx('lines',name,weightC,weights);
	}

	addClaster(name,weightC,weights){
		this.editor.addNeuronEx('clasters',name,weightC,weights);
	}

}

export { AreaNetwork };
