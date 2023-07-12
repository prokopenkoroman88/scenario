import { Bezier } from '../Bezier.js';

class BezierPool{

	constructor(){
		this.bezier = new Bezier();
		this.layer = this.bezier.editor.addLayer();
		this.figures = [];
	}

	nameIndex(name){
		for(let i=0; i<this.figures.length; i++)
			if(this.figures[i].name===name)
				return i;
		return -1;
	}

	figure(name){
		let index = this.nameIndex(name);
		return this.figures[index];
	}

	addFigure(name,rect,func){
		let figure = this.bezier.editor.addFigure();
		figure.name=name;
		figure.rect=rect;
		figure.rect.angle=0;
		func(this.bezier.editor);
		this.figures.push(figure);
	}

	//for Screen

	openFigure(editor, name){
		let layer = editor.content.layers[0];
		let figure = this.figure(name);
		layer.figures=[];
		layer.figures.push(figure);
		editor.curr.figure=figure;
	}

	saveFigureToCode(figure){
		let s=`\n//${figure.name}`;

		figure.points.forEach((point)=>{
			s+=`\n\t\t\teditor.addPoint(${point.x},${point.y});`;
		});

		s+='\n';
		figure.splines.forEach((spline)=>{
			let ids = spline.points.map((point)=>point.index);
			s+=`\n\t\t\teditor.addSpline([${ids[0]},${ids[1]},${ids[2]},${ids[3]}]);`;
		});

		console.log(s);
	}

}

export default BezierPool;
