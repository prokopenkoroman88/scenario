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
			s+=`\n\t\t\teditor.loadPoint(${point.x},${point.y}, ${point.width}, '${point.color}');`;
		});

		s+='\n';
		figure.nodes.forEach((node)=>{
			s+=`\n\t\t\teditor.loadNode(${node.x},${node.y});`;
		});//nodes must be before rotors

		s+='\n';
		figure.rotors.forEach((rotor)=>{
			s+=`\n\t\t\teditor.loadRotor(${rotor.x},${rotor.y}, ${rotor.angle}, [${rotor.pointIds}], [${rotor.nodeIds}], [${rotor.rotorIds}]);`;
		});

		s+='\n';
		figure.branches.forEach((branch)=>{
			s+=`\n\t\t\teditor.loadBranch([${branch.nodeIds}], [${branch.pointIds}]);`;
		});

		s+='\n';
		figure.splines.forEach((spline)=>{
			s+=`\n\t\t\teditor.loadSpline([${spline.pointIds}]);`;
		});

		s+='\n';
		figure.curves.forEach((curve)=>{
			s+=`\n\t\t\teditor.loadCurve([${curve.splineIds}], '${curve.color}');`;
		});

		console.log(s);
	}

}

export default BezierPool;
