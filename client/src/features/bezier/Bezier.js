import Angle from './../../common/Angle.js';
//items:
//import Rect from './items/Rect.js';
//import FigureItem from './items/FigureItem.js';
//import CustomPoint from './items/CustomPoint.js';
import Point from './items/Point.js';
import Rotor from './items/Rotor.js';
import Lever from './items/Lever.js';
import Node from './items/Node.js';
import Branch from './items/Branch.js';
import Spline from './items/Spline.js';
import Curve from './items/Curve.js';
//import FigureContainer from './items/FigureContainer.js';
import Figure from './items/Figure.js';
import Layer from './items/Layer.js';
import Content from './items/Content.js';

function distance(x0,y0,x1,y1){
	return Math.sqrt(Math.pow(x1-x0,2) + Math.pow(y1-y0,2));
}

class Editor{
	constructor(owner){
		this.owner=owner;

		this.settings={
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

	addPoint(x,y,width=1,color='#000'){
		this.curr.point = new Point(this.curr.figure, x,y, width,color);
		this.curr.figure.points.push(this.curr.point);
		return this.curr.point;
	}

	copyPoint(point){
		let copy = this.addPoint(point.x, point.y, point.width, point.color);
		return copy;
	}

	loadPoint(x,y,width,color){
		let point = this.addPoint(x,y,width,color);
	}

	addRotor(x,y,angle=0){
		this.curr.rotor = new Rotor(this.curr.figure, x,y, angle);
		this.curr.figure.rotors.push(this.curr.rotor);
		return this.curr.rotor;
	}

	makeRotor(x,y){
		this.addRotor(x,y,0);
		this.addLever(x,y-20, this.curr.rotor);
		return true;
	}

	copyRotor(rotor){
		let copy = this.addRotor(rotor.x, rotor.y, rotor.angle);
		if(rotor.lever)
			this.addLever(rotor.lever.x, rotor.lever.y, copy);
		copy.points = this.preparePoints(rotor.pointIds);
		copy.nodes = this.prepareNodes(rotor.nodeIds);
		copy.rotors = this.prepareRotors(rotor.rotorIds);
		return copy;
	}

	loadRotor(x,y, angle, points=[], nodes=[], rotors=[]){
		let rotor = this.addRotor(x,y,angle);
		let leverPoint = rotor.leverPoint;//вже з урахуванням кута
		let lever = this.addLever(leverPoint.x, leverPoint.y, rotor);
		rotor.points = this.preparePoints(points);
		rotor.nodes = this.prepareNodes(nodes);
		rotor.rotors = this.prepareRotors(rotors);
		return rotor;
	}

	addLever(x,y, rotor=null){
		if(!rotor)
			rotor=this.curr.rotor;
		this.curr.lever = new Lever(this.curr.figure, x,y, rotor);
		this.curr.figure.levers.push(this.curr.lever);
		return this.curr.lever;
	}

	//copyLever(lever){} виконується в copyRotor
	//loadLever(x,y, rotor){} виконується в loadRotor

	addNode(x,y){
		this.curr.node = new Node(this.curr.figure, x,y);
		this.curr.figure.nodes.push(this.curr.node);
		return this.curr.node;
	}

	copyNode(node){
		let copy = this.addNode(node.x, node.y);
		return copy;
	}

	loadNode(x,y){
		let node = this.addNode(x,y);
		return node;
	}

	addBranch(nodes=[],points=[]){
		if(nodes.length)
			nodes = this.prepareNodes(nodes);
		if(points.length)
			points = this.preparePoints(points);
		this.curr.branch = new Branch(this.curr.figure, nodes, points);
		this.curr.figure.branches.push(this.curr.branch);
		return this.curr.branch;
	}

	makeBranch(x,y){
		const branchLength=2;
		let node=this.getNode(x,y);//find or new
		this.sequence.push(node);
		if(this.sequence.length==branchLength){
			this.addBranch(this.sequence);
			this.sequence.splice(0,branchLength-1)
			return true;
		}
	}

	copyBranch(branch){
		let copy = this.addBranch(branch.nodeIds, branch.pointIds);
		return copy;
	}

	loadBranch(nodes=[],points=[]){
		let branch = this.addBranch(nodes, points);
		return branch;
	}

	getPoint(x,y){
		let point;
		if(!this.findCurr(x,y, 'point'))//changes curr!
			point=this.addPoint(x,y);//new
		else
			point=this.curr.point;//find
		return point;
	}

	getNode(x,y){
		let node;
		if(!this.findCurr(x,y, 'node'))//changes curr!
			node=this.addNode(x,y);//new
		else
			node=this.curr.node;//find
		return node;
	}

	preparePoints(points){
		if(!points)
			return points;
		points=points.map((point)=>{
			let res;
			switch (typeof point) {
				case 'object': {
					if(point.ownFigure)
						res = point;//by Point
					else {
						let id = -1;
						//if(this.needFind)
							id = this.findByCoords('point', point.x, point.y).point;//by {x,y}
						if(id>=0)
							res = this.curr.figure.points[id];//find
						else
							res = this.addPoint(point.x, point.y);//new
					};
				}; break;
				case 'number': res = this.curr.figure.points[point]; break;//by id
				case 'string': res = this.curr.figure.point(point); break;//by name
			};
			return res;
		},this);
		return points;
	}

	prepareRotors(rotors){
		if(!rotors)
			return rotors;
		rotors=rotors.map((rotor)=>{
			let res;
			switch (typeof rotor) {
				case 'object': {
					if(rotor.ownFigure)
						res = rotor;//by Point
					else {
						let id = -1;
						//if(this.needFind)
							id = this.findByCoords('rotor', rotor.x, rotor.y).rotor;//by {x,y}
						if(id>=0)
							res = this.curr.figure.rotors[id];//find
						else
							res = this.addRotor(rotor.x, rotor.y);//new
					};
				}; break;
				case 'number': res = this.curr.figure.rotors[rotor]; break;//by id
				case 'string': res = this.curr.figure.rotor(rotor); break;//by name
			};
			return res;
		},this);
		return rotors;
	}

	prepareNodes(nodes){
		if(!nodes)
			return nodes;
		nodes=nodes.map((node)=>{
			let res;
			switch (typeof node) {
				case 'object': {
					if(node.ownFigure)
						res = node;//by node
					else {
						let id = -1;
						//if(this.needFind)
							id = this.findByCoords('node', node.x, node.y).node;//by {x,y}
						if(id>=0)
							res = this.curr.figure.nodes[id];//find
						else
							res = this.addNode(node.x, node.y);//new
					};
				}; break;
				case 'number': res = this.curr.figure.nodes[node]; break;//by id
				case 'string': res = this.curr.figure.node(node); break;//by name
			};
			return res;
		},this);
		return nodes;
	}

	addSpline(points){//objs or ids or {x,y}
		points = this.preparePoints(points);
		this.curr.spline = new Spline(this.curr.figure, points);//newPoint==this.currPoint
		this.curr.figure.splines.push(this.curr.spline);
		if(this.curr.curve)
			this.curr.curve.splines.push(this.curr.spline);
		return this.curr.spline;
	}

	makeSpline(x,y){
		const splineLength=4;
		let point=this.getPoint(x,y);//find or new
		this.sequence.push(point);
		if(this.sequence.length==splineLength){
			this.addSpline(this.sequence);
			this.sequence.splice(0,splineLength-1)
			return true;
		}
	}

	copySpline(spline){
		let copy = this.addSpline(spline.pointIds);
		return copy;
	}

	loadSpline(points){
		let spline = this.addSpline(points);
		return spline;
	}

	prepareSplines(splines){
		if(!splines)
			return splines;
		splines=splines.map((spline)=>{
			let res;
			switch (typeof spline) {
				case 'object': {
					if(spline.ownFigure)
						res = spline;//by Point
				}; break;
				case 'number': res = this.curr.figure.splines[spline]; break;//by id
				case 'string': res = this.curr.figure.spline(spline); break;//by name
			};
			return res;
		},this);
		return splines;
	}

	addCurve(splines){
		splines = this.prepareSplines(splines);
		this.curr.curve = new Curve(this.curr.figure, splines);
		if(!this.curr.figure){
			if(!this.curr.layer)
				this.curr.layer = this.content.layers[0];
			this.curr.figure = this.curr.layer.figures[0];
		};
		this.curr.figure.curves.push(this.curr.curve);
		return this.curr.curve;
	}

	copyCurve(curve){
		let copy = this.addCurve(curve.splineIds);
		copy.color=curve.color;
		return copy;
	}

	loadCurve(splines, color){
		let curve = this.addCurve(splines);
		curve.color = color;
		return curve;
	}

	insertSplinesToCurve(splines, start=0){
		splines = this.prepareSplines(splines);
		this.curr.curve.splines.splice(start, 0, ...splines);
	}

	addFigure(subFigure=false){
		let figure = new Figure();

		if(subFigure && this.curr.figure){
			this.curr.figure.figures.push(figure);
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
		let margin=100;
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
		let found = this.content.indicesByPath(path);
		return this.content.itemByIndices(found);
	}

	isOwnerCurr(item, attrName){
		//Чи вибраний елемент класу attrName, якому належить елемент item
		const arrName = Figure.arrName(attrName);
		let currOwner = this.curr[attrName];
		let res = (item.getOwners(arrName).indexOf(currOwner)>=0);
		return res;
	}

};


class Render{
	constructor(owner, canvas=null){
		this.owner=owner;
		this.canvas=canvas;
		this.rectByCanvas();
	}

	rectByCanvas(){
		if(this.canvas)
			this.rect={
				top:0,
				bottom:this.canvas.height-1,
				left:0,
				right:this.canvas.width-1,
			};
	}

	get content(){ return this.owner.content; }

	paint(canvas=null, rect=null){
		if(canvas)
			this.canvas=canvas;

		if(rect)
			this.rect=rect;
		if(!this.rect)
			this.rectByCanvas();

		this.prepare();
		for(let y=this.rect.top; y<=this.rect.bottom; y++){
			this.prepare_vert(y);
			for(let x=this.rect.left; x<=this.rect.right; x++){
				this.prepare_horiz(x);
				let rgba = this.prepare_color(x,y);
				this.canvas.setRGB(x,y,rgba);
			};//x++
		};//y++
		this.canvas.put();
	}

	prepareLinesByFigure(figure){
		if(!figure)
			return;

		function dist(p1,p2){
			return distance(p1.x,p1.y, p2.x,p2.y);
		};


		const line_length=10;

				figure.splines.forEach( (spline, iSpline) => {
					let points = spline.points;

					let c=0;
					for(let i=1; i<points.length; i++)
						c+=dist(points[i-1],points[i]);

					let oldPoint, newPoint=points[0];
					let oldDot, newDot=newPoint;
					let oldDist, newDist=0;
					function addLine(coeff=1){
							let line;
							let delta_y = Math.sign((newDot.y-oldDot.y).toFixed(0));
							let delta_x = Math.sign((newDot.x-oldDot.x).toFixed(0));
							if(delta_y<0 || (delta_y==0 && delta_x<0))
								line={dot1:newDot, dot2:oldDot};
							if(delta_y>0 || (delta_y==0 && delta_x>0))
								line={dot1:oldDot, dot2:newDot};
							if(delta_y==0 && delta_x==0)
								return;
							if(!line)
								return;
							line.spline=spline;
							let width=spline.controlPoint[0].width + (spline.controlPoint[1].width-spline.controlPoint[0].width)*coeff;
							let sin = Math.sin(Math.atan2(line.dot2.y-line.dot1.y, line.dot2.x-line.dot1.x));
							if(Math.abs(sin)<=0.1)
								line.width_x = width + Math.abs( line.dot2.x-line.dot1.x );
							else
								line.width_x = width / Math.abs( sin );

							if(line.dot1.y<0 || line.dot2.y<0 || line.dot1.y>=this.rows.length || line.dot2.y>=this.rows.length)
								return;

							if(delta_y==0){
								this.rows[Math.round(line.dot1.y)].lines.push({line:line, x:line.dot1.x, left:true});
								this.rows[Math.round(line.dot2.y)].lines.push({line:line, x:line.dot2.x, right:true});
							}
							else{
								this.rows[Math.round(line.dot1.y)].lines.push({line:line, x:line.dot1.x, top:true});
								this.rows[Math.round(line.dot2.y)].lines.push({line:line, x:line.dot2.x, bottom:true});
							};
					};

					for(let i=1; i<=c; i++){
						oldPoint = newPoint;
						oldDist = newDist;

						newPoint = Spline.findInterimBezierPoint(points, i/c);
						newDist=dist(newDot,newPoint);

						while(newDist>=line_length){
							let distL = line_length-oldDist;
							let distR = newDist-line_length;
							oldDot = newDot;
							newDot = Spline.findInterimPoint(oldPoint, newPoint, distL/(distL + distR)/2 );
							addLine.bind(this)(i/c);

							newDist=dist(newDot,newPoint);
						};
						//this.paintPoint(newPoint,rgba);
					};///i++
					//last part:
					oldDot = newDot;
					newDot = points[ points.length-1 ];
					addLine.bind(this)(1);

				},this);//spline

	}

	prepareByFigure(figure){
		if(!figure)
			return;
		this.prepareLinesByFigure(figure);
		figure.figures.forEach( (nested_figure, iNestedFigure) => {
			this.prepareByFigure(nested_figure);
		}, this);
	}

	prepare(){

		this.rows = new Array(this.canvas.height);
		for(let i=0; i<this.rows.length; i++)
			this.rows[i]={
				lines:[],
			};
		this.currLines=[];
		const line_length=10;

		this.content.layers.forEach( (layer, iLayer) => {
			layer.figures.forEach( (figure, iFigure) => {
				this.prepareByFigure(figure);
			},this);//figure
		},this);//layer
	}

	prepare_vert(y){
		//sort lines by y:
		this.rows[y].lines.sort((line1,line2)=>{ return line1.x-line2.x});

		//adding of curr lines:
		this.rows[y].lines.forEach( function(line, index) {
			if(line.top || line.left)
				this.currLines.push(line.line);
			if(line.bottom){
				let iDel=this.currLines.indexOf(line.line);
				if(iDel>=0)
					this.currLines.splice(iDel, 1);
			};
		},this);


		//find crosses by row y
		this.crosses = this.currLines.map((line, index)=>{
			let coeff;
			let calced_x;

			if( Math.round(line.dot1.y)==Math.round(line.dot2.y) )
				coeff=0.5;
			else
				coeff = (y-line.dot1.y)/ (line.dot2.y-line.dot1.y);
			calced_x = line.dot1.x + (line.dot2.x-line.dot1.x) * coeff;

			return {
				line:line,
				x:Math.round(calced_x),
				left_x:Math.round(calced_x-line.width_x/2),
				right_x:Math.round(calced_x+line.width_x/2),
				//curve:,
			};
		}, this);
		this.crosses.sort((cross1,cross2)=>{ return cross1.x-cross2.x });

		//curves:
		this.row_curves=[];
		this.crosses.forEach( (cross, index)=>{
			let spline_curves = cross.line.spline.curves;
			if(index==0){
				this.row_curves.push(...spline_curves);
				cross.next_curve = spline_curves[0];
			}
			else{
				spline_curves.forEach( function(spline_curve, index) {
					// statements
					let i = this.row_curves.indexOf(spline_curve);
					if(i<0){
						cross.next_curve = spline_curve;//open new
						this.row_curves.push(spline_curve);
					}
					else{
						//if(spline_curve!=cross.next_curve){
						if(index==0 || Math.abs( this.crosses[index-1].right_x - cross.left_x )>5 ){//????????????
							cross.last_curve = spline_curve;//close old
							this.row_curves.splice(i, 1);
						};
					};
				},this);
			};

		},this);
		//clean upper crosses:
		for (let i = this.crosses.length - 1; i >= 0; i--) {
			if(this.crosses[i].line.dot1.y<y && this.crosses[i].line.dot2.y<y)
				this.crosses.splice(i,1);
		};

		//deleting of old curr lines:
		this.rows[y].lines.forEach( function(line, index) {
			if(line.right){
				let iDel=this.currLines.indexOf(line.line);
				if(iDel>=0)
					this.currLines.splice(iDel, 1);
			};
		},this);

		this.index_x=-1;
		this.row_curves=[];
	}

	prepare_horiz(x){
		if(this.is_line && this.index_x>=0 && this.crosses[this.index_x].right_x == x){
			if(this.crosses[this.index_x].next_curve)
				this.row_curves.push( this.crosses[this.index_x].next_curve );
		};
		this.is_line=(this.index_x>=0 && this.crosses[this.index_x].right_x >= x);
		while((this.index_x+1<this.crosses.length) && (this.crosses[this.index_x+1].left_x <= x)){
			this.index_x++;
			//Curves that are bounded by these lines
			//this.crosses[this.index_x+1].curve
			let iCurve = this.row_curves.indexOf(this.crosses[this.index_x].last_curve);
			if(iCurve>=0)
				this.row_curves.splice(iCurve, 1);//не обов'язково стек
			this.is_line=true;
		};
	}

	prepare_color(x,y){
		let rgba=[0,0,0,155];
		if(this.is_line)
			rgba=[230,190,80,55];
		else if (this.row_curves.length>0) {
			let i=this.row_curves.length;
			i--;
			if(i>=0)
				rgba=this.row_curves[i].color;
		}
		if(!rgba)
			rgba=[0,0,0,155];
		return rgba;
	}


	//applications
	paintPoint(point,rgba){
			let x=Math.round(point.x);
			let y=Math.round(point.y);
			this.canvas.setRGB(x,y,rgba);
	}

	paintBezier(aDot, color){//PixelColor color
		let rgba=Array.isArray(color)?color:color.toArray();

		let oldPoint, newPoint=aDot[0];
		let c=0;
		for(let i=1;i<aDot.length;i++)
			c+=distance(aDot[i-1].x,aDot[i-1].y,aDot[i].x,aDot[i].y);

		for(let i=1; i<=c; i++){
			oldPoint = newPoint;
			newPoint = Spline.findInterimBezierPoint(aDot, i/c);
			this.paintPoint(newPoint,rgba);
		};
		//this.canvas.put();
	}

	//context:

	stroke(color){
		let ctx = this.canvas.ctx;
		let strokeStyle = ctx.strokeStyle
		ctx.strokeStyle = color;
		ctx.stroke();
		ctx.strokeStyle = strokeStyle;
	}

	paintFigureRect(figure, color){
		if(!figure || !figure.rect)
			return;
		let points = figure.rectPoints;
		let ctx = this.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(points[3].x, points[3].y);
		points.forEach(p=>ctx.lineTo(p.x, p.y));
		this.stroke(color);
	}

	paintEllipse(point, color, radius=1){
		let ctx = this.canvas.ctx;
		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, Math.PI*2, true);
		this.stroke(color);
	}

	paintLine(point1, point2, color){
		let ctx = this.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(point1.x, point1.y);
		ctx.lineTo(point2.x, point2.y);
		this.stroke(color);
	}

};


class Bezier{

	constructor(canvas=null){
		this.canvas=canvas;
		this.content = {
			layers : [],
		};
		this.editor = new Editor(this);
		this.render = new Render(this, this.canvas);
	}

	setCanvas(canvas){
		this.canvas=canvas;
		this.render.canvas=this.canvas;
		this.render.rectByCanvas();
	}

	paint(rect=null){
		this.render.paint(this.canvas, rect);
	}

};


export { Bezier };
