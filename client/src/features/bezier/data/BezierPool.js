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

/*
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

		s+='\n';
		figure.figures.forEach((figure)=>{
			let params = figure.params;
			if(!params){
				params = figure.rect;
				params.name = figure.name;
			};
			let sParams = JSON.stringify(params);
			s+=`\n\t\t\teditor.integrateFigure( this.figure('${figure.parent.name}'), ${sParams});`;
		});

		console.log(s);
	}
*/

	getIndent(indentLength=0){
		let indent='';
		for(let i=0; i<indentLength; i++)
			indent+='\t';
		return indent;
	}

	saveFigureItemsToCode(figure, indentLength=0){

		function saveItems(attr, getParams=null){
			let arr = figure.constructor.arrName(attr);
			let cls = attr.charAt(0).toUpperCase() + attr.substring(1);
			if(!figure[arr].length)
				return;
			s+=`\n\n${indents}//${arr}:`;
			figure[arr].forEach((item)=>{
				let params = '';
				if(getParams)
					params = getParams(item);
				s+=`\n${indents}editor.load${cls}(${params});`;
			});
		};

		let s='';
		let indents=this.getIndent(indentLength);

		saveItems('point', (point)=>`${point.x},${point.y}, ${point.width}, '${point.color}'`);
		saveItems('node', (node)=>`${node.x},${node.y}`);//nodes must be before rotors
		saveItems('rotor', (rotor)=>`${rotor.x},${rotor.y}, ${rotor.angle}, [${rotor.pointIds}], [${rotor.nodeIds}], [${rotor.rotorIds}]`);
		saveItems('branch', (branch)=>`[${branch.nodeIds}], [${branch.pointIds}]`);
		saveItems('spline', (spline)=>`[${spline.pointIds}]`);
		saveItems('curve', (curve)=>`[${curve.splineIds}], '${curve.color}'`);
		//saveItems('point', (point)=>``);

		if(!figure.figures.length)
			return s;
		s+=`\n\n${indents}//figures`;
		figure.figures.forEach((figure)=>{
			s+=this.saveFigureToCode(figure, indentLength);
		});
		return s;
	}

	saveFigureToCode(figure, indentLength=0, bMain=false){
		let s=`\n${this.getIndent(indentLength)}//${figure.name}`;

		let params = figure.params;
		if(!params){
			params = figure.rect;
			params.name = figure.name;
		};
		let sParams = JSON.stringify(params);
		if(figure.parent){
			s+=`\n${this.getIndent(indentLength)}editor.integrateFigure( this.figure('${figure.parent.name}'), ${sParams});`;
			return s;
		}
		else{
			if(bMain)
				s+=`\n${this.getIndent(indentLength++)}this.addFigure('${figure.name}', ${sParams}, (editor)=>{`;//});
			else
				s+=`\n${this.getIndent(indentLength++)}editor.loadFigure(${sParams},(editor)=>{`;//});
			};

		s+=this.saveFigureItemsToCode(figure, indentLength);
		s+=`\n${this.getIndent(--indentLength)}});//${figure.name}`;
		return s;
	}

	saveMainFigureToCode(content){
		if(!content)
			return '';
		let figure = content.layers[0].figures[0];
		let s=this.saveFigureToCode(figure, 2, true);
		return s;
	}

	saveContentToCode(content, indentLength=0){
		if(!content)
			return '';
		let s='';
		content.layers.forEach((layer)=>{
			s+=`\n${this.getIndent(indentLength)}editor.loadLayer('${layer.name}')`;
			layer.figures.forEach((figure)=>{

				s+=this.saveFigureToCode(figure, indentLength);
			});
		});
		return s;
	}

}

export default BezierPool;
