import Angle from './../../common/Angle.js';
//items:
//import Rect from './items/common/Rect.js';
//import FigureItem from './items/custom/FigureItem.js';
//import CustomPoint from './items/custom/CustomPoint.js';
import Point from './items/figure/Point.js';
import Rotor from './items/figure/Rotor.js';
import Lever from './items/figure/Lever.js';
import Node from './items/figure/Node.js';
import Branch from './items/figure/Branch.js';
import Spline from './items/figure/Spline.js';
import Curve from './items/figure/Curve.js';
//import FigureContainer from './items/custom/FigureContainer.js';
import Figure from './items/Figure.js';
import Layer from './items/Layer.js';
import Content from './items/Content.js';

import PictureRender from './render/PictureRender.js';


class Editor{
	constructor(owner){
		this.owner=owner;

		this.settings={
			MAIN_INDENT:100,
			CURSOR_RADIUS:5,
		};

		this.oldPoint={x:0,y:0};

		this.curr={
			point:null,
			rotor:null,
			spline:null,
			figure:null,
		};

		this.found={
			point:-1,
		};

		this.sequence=[];
	}

	get content(){ return this.owner.content; }

	newPage(){
		this.newContent();
		this.addLayer();
		this.addFigure();
		this.initMainFigureRect();
	}

	addPoint(record){
		this.curr.point = new Point(this.curr.figure, record);
		this.curr.figure.points.push(this.curr.point);
		return this.curr.point;
	}

	copyPoint(point){
		let copy = this.addPoint(point.record);
		return copy;
	}

	loadPoint(record){
		let point = this.addPoint(record);
	}

	addRotor(record){
		this.curr.rotor = new Rotor(this.curr.figure, record);
		this.curr.figure.rotors.push(this.curr.rotor);
		return this.curr.rotor;
	}

	linkRotor(points=[], nodes=[], rotors=[]){
		if(points.length)
			points = this.preparePoints(points);
		if(nodes.length)
			nodes = this.prepareNodes(nodes);
		if(rotors.length)
			rotors = this.prepareRotors(rotors);
		this.curr.rotor.linkItems(points, nodes, rotors);
	}

	makeRotor(x,y){
		this.addRotor({x,y,angle:0});
		this.addLever({x,y:y-20}, this.curr.rotor);
		return true;
	}

	copyRotor(rotor){
		let copy = this.addRotor(rotor.record);
		if(rotor.lever)
			this.addLever(rotor.lever.record, copy);
		this.linkRotor(rotor.pointIds, rotor.nodeIds, rotor.rotorIds);
		return copy;
	}

	loadRotor(record, points=[], nodes=[], rotors=[]){
		let rotor = this.addRotor(record);
		let leverPoint = rotor.leverPoint;//вже з урахуванням кута
		let lever = this.addLever(leverPoint.record, rotor);
		this.linkRotor(points, nodes, rotors);
		return rotor;
	}

	addLever(record, rotor=null){
		if(!rotor)
			rotor=this.curr.rotor;
		this.curr.lever = new Lever(this.curr.figure, record);
		this.curr.lever.linkRotor(rotor);
		this.curr.figure.levers.push(this.curr.lever);
		return this.curr.lever;
	}

	//copyLever(lever){} виконується в copyRotor
	//loadLever(x,y, rotor){} виконується в loadRotor

	addNode(record){
		this.curr.node = new Node(this.curr.figure, record);
		this.curr.figure.nodes.push(this.curr.node);
		return this.curr.node;
	}

	copyNode(node){
		let copy = this.addNode(node.record);
		return copy;
	}

	loadNode(record){
		let node = this.addNode(record);
		return node;
	}

	addBranch(record){
		this.curr.branch = new Branch(this.curr.figure, record);
		this.curr.figure.branches.push(this.curr.branch);
		return this.curr.branch;
	}

	linkBranch(nodes=[],points=[]){
		if(nodes.length)
			nodes = this.prepareNodes(nodes);
		if(points.length)
			points = this.preparePoints(points);
		this.curr.branch.linkItems(nodes, points);
	}

	makeBranch(x,y){
		const branchLength=2;
		let node=this.getNode(x,y);//find or new
		this.sequence.push(node);
		if(this.sequence.length==branchLength){
			this.addBranch();
			this.linkBranch(this.sequence);
			this.sequence.splice(0,branchLength-1)
			return true;
		}
	}

	copyBranch(branch){
		let copy = this.addBranch(branch.record);
		this.linkBranch(branch.nodeIds, branch.pointIds);
		copy.parent = branch;
		return copy;
	}

	loadBranch(record,nodes=[],points=[]){
		let branch = this.addBranch(record);
		this.linkBranch(nodes, points);
		return branch;
	}

	getPoint(x,y){
		let point;
		if(!this.findCurr(x,y, 'point'))//changes curr!
			point=this.addPoint({x,y});//new
		else
			point=this.curr.point;//find
		return point;
	}

	getNode(x,y){
		let node;
		if(!this.findCurr(x,y, 'node'))//changes curr!
			node=this.addNode({x,y});//new
		else
			node=this.curr.node;//find
		return node;
	}

	preparePoints(points){
		if(!points)
			return points;
		points=this.curr.figure.getItems('point', points, (point)=>{
			let res;
						let id = -1;
						//if(this.needFind)
							id = this.findByCoords('point', point.x, point.y).point;//by {x,y}
						if(id>=0)
							res = this.curr.figure.points[id];//find
						else
							res = this.addPoint(point);//new {x,y}
			return res;
		});
		return points;
	}

	prepareRotors(rotors){
		if(!rotors)
			return rotors;
		rotors=this.curr.figure.getItems('rotor', rotors, (rotor)=>{
			let res;
						let id = -1;
						//if(this.needFind)
							id = this.findByCoords('rotor', rotor.x, rotor.y).rotor;//by {x,y}
						if(id>=0)
							res = this.curr.figure.rotors[id];//find
						else
							res = this.addRotor(rotor);//new {x,y}
			return res;
		});
		return rotors;
	}

	prepareNodes(nodes){
		if(!nodes)
			return nodes;
		nodes=this.curr.figure.getItems('node', nodes, (node)=>{
			let res;
						let id = -1;
						//if(this.needFind)
							id = this.findByCoords('node', node.x, node.y).node;//by {x,y}
						if(id>=0)
							res = this.curr.figure.nodes[id];//find
						else
							res = this.addNode(node);//new {x,y}
			return res;
		});

		return nodes;
	}

	addSpline(record){
		this.curr.spline = new Spline(this.curr.figure, record);//newPoint==this.currPoint
		this.curr.figure.splines.push(this.curr.spline);
		if(this.curr.curve)
			this.curr.curve.splines.push(this.curr.spline);
		return this.curr.spline;
	}

	linkSpline(points=[]){//objs or ids or {x,y}
		points = this.preparePoints(points);
		console.log('points', points);
		this.curr.spline.linkItems(points);
	}

	makeSpline(x,y){
		const splineLength=4;
		let point=this.getPoint(x,y);//find or new
		this.sequence.push(point);
		console.log('sequence', this.sequence);
		if(this.sequence.length==splineLength){
			this.addSpline();
			this.linkSpline(this.sequence);
			this.sequence.splice(0,splineLength-1)
			return true;
		}
	}

	copySpline(spline){
		let copy = this.addSpline(spline.record);
		this.linkSpline(spline.pointIds);
		return copy;
	}

	loadSpline(record, points){
		let spline = this.addSpline(record);
		this.linkSpline(points);
		return spline;
	}

	addCurve(record){
		this.curr.curve = new Curve(this.curr.figure, record);
		if(!this.curr.figure){
			if(!this.curr.layer)
				this.curr.layer = this.content.layers[0];
			this.curr.figure = this.curr.layer.figures[0];
		};
		this.curr.figure.curves.push(this.curr.curve);
		return this.curr.curve;
	}

	linkCurve(splines=[]){
		this.curr.curve.linkItems(splines);
	}

	copyCurve(curve){
		let copy = this.addCurve(curve.record);
		this.linkCurve(curve.splineIds);
		return copy;
	}

	loadCurve(record, splines){
		let curve = this.addCurve(record);
		this.linkCurve(splines);
		return curve;
	}

	addFigure(subFigure=false){
		let figure = new Figure();

		if(subFigure && this.curr.figure){
			this.curr.figure.figures.push(figure);
			figure.ownFigure=this.curr.figure;
		}
		else{
			if(!this.curr.layer)
				this.curr.layer = this.content.layers[0];
			this.curr.layer.figures.push(figure);
		}

		this.curr.figure = figure;
		return this.curr.figure;
	}

	copyFigure(original){
		//Додасть копію фігури original до поточної фігури або шару
		if(!original)
			return;

		const owner = this.curr.figure;
		const tmp_curr_figure = this.curr.figure;//!
		const copy = new Figure();
		copy.name = original.name;//for details copied from original
		copy.parent = original;
		this.curr.figure = copy;//! методи copy<Item> і add<Item> працюють з curr.figure
		copy.ownFigure = owner;
		let figures = owner?owner.figures:this.curr.layer.figures;
		figures.push(copy);
		copy.rect = {...original.rect};

		original.points.forEach(element=>this.copyPoint(element));
		original.rotors.forEach(element=>this.copyRotor(element));
		original.nodes.forEach(element=>this.copyNode(element));
		original.branches.forEach(element=>this.copyBranch(element));
		original.splines.forEach(element=>this.copySpline(element));
		original.curves.forEach(element=>this.copyCurve(element));
		original.figures.forEach(element=>this.copyFigure(element));//recursion

		this.curr.figure = tmp_curr_figure;//!
		return copy;
	}

	loadFigure(params, func){
		const tmp_curr_figure = this.curr.figure;//!
		let figure = this.addFigure(true);
		figure.setParamsCascade(params);
		if(func)
			func(this);
		this.curr.figure = tmp_curr_figure;//!
	}

	integrateFigure(original, params){
		//у поточну фігуру curr.figure додає копію фігури original із застосуванням параметрів params
		let copy=this.copyFigure(original);
		copy.name = params.name?params.name:original.name;
		copy.parent = original;
		copy.params = params;
		copy.setParamsCascade(params);
		return true;
	}

	initMainFigureRect(){
		let width=this.owner.canvas.width;
		let height=this.owner.canvas.height;
		let margin=this.settings.MAIN_INDENT;
		this.curr.figure.rect.cx=Math.round(width/2);
		this.curr.figure.rect.cy=Math.round(height/2);
		this.curr.figure.rect.width=width-margin;
		this.curr.figure.rect.height=height-margin;
	}

	addLayer(){
		this.curr.layer = new Layer();
		this.content.layers.push(this.curr.layer);
		return this.curr.layer;
	}

	loadLayer(name){
		this.addLayer();
		this.curr.layer.name=name;
	}

	newContent(){
		this.owner.content = new Content();
		return this.content;
	}

	find(arr, x,y){
		for(let index=0; index<arr.length; index++){
			let item=arr[index];//item may be point, rotor, spline, figure
			if(item.isNear(x,y,this.settings.CURSOR_RADIUS))
				return index;
		};
		return -1;
	}

	findByCoords(attrName,x,y){
		//attrName in ['point', 'rotor', 'spline']

		let arrName=Figure.arrName(attrName);
		let isNear=false;
		this.found[attrName] = -1;
		//this.found.point = -1;
		//this.found.rotor = -1;
		//this.found.spline = -1;
		//this.found.curve = -1;//?
		this.found.figure = [];
		this.found.layer = -1;

		let layers=this.content.layers;
		for(let iLayer=layers.length-1; iLayer>=0; iLayer--){
			//шукаємо деталь фігури від верхнього шару до нижнього
			let layer=layers[iLayer];

			let figure_path=[];//ids
			layer.figures.forEach( (figure, iFigure)=>{

				function findIn(figure, index){
					if(!figure)
						return;
					figure_path.push(index);
					let arr=figure[arrName];
					let attrIndex=this.find(arr,x,y);
					isNear=attrIndex>=0;
					if(isNear){
						this.found[attrName]=attrIndex;
						return;
					};
					for(let i=0; i<figure.figures.length; i++){
						findIn.bind(this)(figure.figures[i], i);
						if(isNear)
							return
					};
					figure_path.pop();
				};
				findIn.bind(this)(figure, iFigure);

				if (isNear){
					this.found.figure=figure_path;//array of ids
					return;
				};
			});
			if (isNear){
				this.found.layer=iLayer;
				break;//return;
			};
		};
		return this.found;

	}

	findFigureByCoords(x,y){
		let isNear=false;
		this.found.figure = [];
		this.found.layer = -1;

		//шляхи до фігур, які потраплять за координатами
		let choiced_pathes=[];

		let layers=this.content.layers;
		for(let iLayer=layers.length-1; iLayer>=0; iLayer--){
			//шукаємо фігуру від верхнього шару до нижнього
			let layer=layers[iLayer];

			let figure_path=[];//ids
			layer.figures.forEach( (figure, iFigure)=>{

				function findSubFigure(figure,index){
					figure_path.push(index);
					if(figure.isNear(x,y,this.settings.CURSOR_RADIUS)){
						let pth=figure_path.map((el)=>{return el});
						choiced_pathes.push(pth);
					}

					figure.figures.forEach((sub_figure,index)=>{
						findSubFigure.bind(this)(sub_figure,index);
					});
					figure_path.pop();
				};

				findSubFigure.bind(this)(figure,iFigure);
			});

			//всі фігури на шарі, які потрапили за координатами
			if(choiced_pathes.length){
				let iMax=-1, lenMax=0;
				choiced_pathes.forEach((path, index)=>{
					if(path.length>=lenMax){
						iMax=index;
						lenMax=path.length;
					}
				});
				this.found.layer=iLayer;
				if(iMax>=0)
					this.found.figure=choiced_pathes[iMax];
				return this.found;
			};

		};

		return this.found;
	}

	findCurr(x,y, attrName, needClear=true){
		//x,y -> found.index -> curr.object
		const bFigure=attrName=='figure'
		const arrName=Figure.arrName(attrName);//'points', 'rotors', 'splines', ...
		let found, curr;
		if(bFigure)
			found=this.findFigureByCoords(x,y);
		else
			found=this.findByCoords(attrName,x,y);
		let attrIndex = -1;
		if(found)
			attrIndex = found[attrName];

		const hasResult=bFigure?attrIndex.length>0:attrIndex>=0;
		//console.log('findCurr',found,attrName,attrIndex)
		if(hasResult){
			curr = this.content;
			if(found.layer>=0)
				curr = curr.layers[found.layer];//поточний шар
			if(found.figure.length>0){
				found.figure.forEach((figureIndex)=>{
					curr = curr.figures[figureIndex];//поточна фігура
				});
			}
			if(!bFigure)
				curr = curr[arrName][attrIndex];//поточна деталь фігури
			this.curr[attrName] = curr;
			return true;
		}
		else
			if(needClear)
				this.curr[attrName]=null;
	}

	findByPath(path){
		return this.content.byPath(path);
	}

	isOwnerCurr(item, attrName){
		//Чи вибраний елемент класу attrName, якому належить елемент item
		const arrName = Figure.arrName(attrName);
		let currOwner = this.curr[attrName];
		let res = (item.getOwners(arrName).indexOf(currOwner)>=0);
		return res;
	}

};




class Picture{

	constructor(canvas=null){
		this.canvas=canvas;
		this.editor = new Editor(this);
		this.editor.newContent();
		this.render = new PictureRender(this.content, this.canvas);
	}

	setCanvas(canvas){
		this.canvas=canvas;
		this.render.canvas=this.canvas;
		this.render.rectByCanvas();
	}

	paint(rect=null){
		this.render.content=this.content;
		this.render.paint(this.canvas, rect);
	}

};


export default Picture;
