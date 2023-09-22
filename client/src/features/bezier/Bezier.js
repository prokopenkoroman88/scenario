import Angle from './../../common/Angle.js';

const CURSOR_RADIUS=5;
const LEVER_RADIUS=40;

class Rect{

	constructor(){
		this.reset();
	}

	reset(){
		this.left=10000;
		this.right=-10000;
		this.top=10000;
		this.bottom=-10000;
	}

	correct(point){
		if(this.left>point.x)
			this.left=point.x;
		if(this.right<point.x)
			this.right=point.x;
		if(this.top>point.y)
			this.top=point.y;
		if(this.bottom<point.y)
			this.bottom=point.y;
	}

	prepare(points){
		this.reset();
		points.forEach(point=>this.correct(point));
		this.left-=CURSOR_RADIUS;
		this.top-=CURSOR_RADIUS;
		this.right+=CURSOR_RADIUS;
		this.bottom+=CURSOR_RADIUS;
	}

	inRect(x,y){
		return (x>=this.left && x<=this.right && y>=this.top && y<=this.bottom);
	}

};

function distance(x0,y0,x1,y1){
	return Math.sqrt(Math.pow(x1-x0,2) + Math.pow(y1-y0,2));
}

class FigureItem{

	get array(){ return ''; }

	get index(){ return this.ownFigure[this.array].indexOf(this); }

	constructor(ownerFigure){
		this.ownFigure=ownerFigure;
	}

};

class CustomPoint extends FigureItem{

	constructor(ownerFigure,x,y){
		super(ownerFigure);
		this.x = x;
		this.y = y;
	}

	shift(dx,dy){
		this.x+=dx;
		this.y+=dy
	}

	distance(x,y){
		return Angle.dist2D(this, {x,y});
	}

	isNear(x,y){
		return (this.distance(x,y)<CURSOR_RADIUS);
	}

	grow(center, dw, dh){
		if(!center)
			center=this.ownFigure.center;
		this.x = Angle.grow(center.x, this.x, dw);
		this.y = Angle.grow(center.y, this.y, dh);
	}

	rotate(center,angle=0){
		if(!center)
			center=this.ownFigure.center;
		Angle.rotate2D(center, this,angle);
	}

	round(fractionDigits=0){
		this.x = +(this.x).toFixed(fractionDigits);
		this.y = +(this.y).toFixed(fractionDigits);
	}

};

class Point extends CustomPoint{

	get array(){ return 'points'; }

	constructor(ownerFigure,x,y,width=1,color='#000'){
		super(ownerFigure,x,y);
		this.width = width;
		this.color = color;
	}

	get splines(){
		//find splines of point:
		let point_splines=[];
		let point=this;
		this.ownFigure.splines.forEach( (spline)=>{
			if(spline.points.indexOf(point)>=0)
				point_splines.push(spline);
		});
		return point_splines;
	}
}

class Rotor extends CustomPoint {

	get array(){ return 'rotors'; }

	constructor(ownerFigure,x,y,angle=0){
		super(ownerFigure,x,y);
		this.mainAngle = 0;//кут, отриманий від конфігурації старших роторів, за ним знаходитья lever, коли angle = 0
		this.angle = angle;//власний кут
		this.points = [];
		this.nodes = [];
		this.rotors = [];
	}

	shift(dx,dy,bCascade=true){
		super.shift(dx,dy);
		if(!bCascade) return;
		this.points.forEach(point=>point.shift(dx,dy));
		this.nodes.forEach(node=>node.shift(dx,dy));
		this.rotors.forEach(rotor=>rotor.shift(dx,dy,bCascade));
	}

	preparePoints(rotor, dangle){
		if(dangle==0) return;
		//rotor == this || this.rotors[]
		const center = this;
		rotor.points.forEach(point=>point.rotate(center, dangle));
		rotor.nodes.forEach(node=>node.rotate(center, dangle));
		rotor.rotors.forEach(rotor=>rotor.rotate(center, dangle));
		rotor.rotors.forEach(rotor=>rotor.lever.rotate(center, dangle));
		let branches = rotor.ownFigure.branches;
		branches.forEach(branch=>branch.prepare());
		let splines = rotor.ownFigure.splines;
		splines.forEach(spline=>spline.prepare());
	}

	rotateAround(rotor=null, dangle=0){
		if(dangle==0)
			return;
		const center = this;
		if(!rotor)
			rotor=this;
		if(rotor!=this)
			rotor.mainAngle+=dangle;//Змінюється для підлеглих роторів

		this.preparePoints(rotor, dangle);

		rotor.rotors.forEach(rotor=>this.rotateAround(rotor, dangle));
	}

	get leverPoint(){
		if(this.lever)
			return this.lever;

		for(let lever in this.ownFigure.levers)
			if(lever.rotor==this){
				this.lever=lever;
				return lever;
			};

		let lever = {x:this.x, y:this.y-LEVER_RADIUS};
		Angle.rotate2D(this, lever, this.leverAngle);
		return lever;
	}

	get pointIds(){
		let ids = this.points.map((point)=>{
			return this.ownFigure.points.indexOf(point);
		},this);
		return ids;
	}

	get nodeIds(){
		let ids = this.nodes.map((node)=>{
			return this.ownFigure.nodes.indexOf(node);
		},this);
		return ids;
	}

	get rotorIds(){
		let ids = this.rotors.map((rotor)=>{
			return this.ownFigure.rotors.indexOf(rotor);
		},this);
		return ids;
	}

	changeAngle(dangle){
		if(dangle==0)
			return;
		this.rotateAround(this, dangle);
		this.angle+=dangle;
		this.ownFigure.round();
	}

	setAngle(angle){
		let dangle=Angle.diff(this.angle, angle);
		if(dangle==0)
			return;
		this.changeAngle(dangle);
	}

	set leverAngle(angle){
		this.setAngle(angle - this.mainAngle);
	}

	get leverAngle(){
		return this.mainAngle + this.angle;
	}

};

class Lever extends CustomPoint {

	get array(){ return 'levers'; }

	constructor(ownerFigure,x,y,rotor=null){
		super(ownerFigure,x,y);
		this.rotor = rotor;
		if(this.rotor)
			this.rotor.lever=this;
	}

	shift(dx,dy,bCascade=true){
		super.shift(dx,dy);
		if(!bCascade) return;
		if(this.rotor){
			let angle = Angle.angle(this.rotor, this);
			this.rotor.leverAngle = angle;
		};
	}

};

class Node extends CustomPoint {

	get array(){ return 'nodes'; }

	constructor(ownerFigure,x,y){
		super(ownerFigure,x,y);
	}

	get branches(){
		//find branches of node:
		let node_branches=[];
		let node=this;
		this.ownFigure.branches.forEach( (branch)=>{
			if(branch.nodes.indexOf(node)>=0)
				node_branches.push(branch);
		});
		return node_branches;
	}

	shift(dx,dy,bCascade=!true){
		if(bCascade){
			this.branches.forEach(branch=>branch.shift(dx,dy, this));
			this.ownFigure.splines.forEach(spline=>spline.prepare());
		};
		super.shift(dx,dy);
		this.ownFigure.branches.forEach(branch=>branch.prepare());
	}

};

class Branch extends FigureItem{

	get array(){ return 'branches'; }

	constructor(ownerFigure, nodes, points){
		super(ownerFigure);
		this.nodes=nodes;//[0,1]
		this.points=points;
		this.prepare();
	}

	get nodeIds(){
		let ids = this.nodes.map((node)=>{
			return this.ownFigure.nodes.indexOf(node);
		},this);
		return ids;
	}

	get pointIds(){
		let ids = this.points.map((point)=>{
			return this.ownFigure.points.indexOf(point);
		},this);
		return ids;
	}

	prepareRect(){
		this.rect.prepare(this.nodes);
	}

	prepare(){
		if(!this.rect)
			this.rect = new Rect();
		this.prepareRect();
	}

	shift(dx,dy, node){
		//Пересування node спричиняє пересування пов'язаних з цим branch точок
		let old_node0 = this.nodes[0];
		let old_node1 = this.nodes[1];

		let old_dist = Angle.dist2D(old_node0, old_node1);
		let old_angle = Angle.angle(old_node0, old_node1);

		let iNode = this.nodes.indexOf(node);
		if(iNode<0)
			return;

		let new_node0 = old_node0;
		if(iNode==0)
			new_node0 = Angle.newDot(old_node0,{dx,dy});//копія, щоби не перемістити nodes[0] завчасно

		let new_node1 = old_node1;
		if(iNode==1)
			new_node1 = Angle.newDot(old_node1,{dx,dy});

		let new_dist = Angle.dist2D(new_node0, new_node1);
		let new_angle = Angle.angle(new_node0, new_node1);

		this.points.forEach(point=>{
			let coords=this.calcCoords(point);
			let coordsH={
				angle : new_angle,
				dist : coords.height * (new_dist/old_dist),
			};
			let coordsW={
				angle : new_angle+Math.PI/2,
				dist : coords.width,
			};
			//переміщення points здійснюється від nodes[0]
			let pointH=Angle.newDot(new_node0, coordsH);
			Angle.moveRadial(pointH, point, coordsW);
		});
	}

	calcCoords(point){
		let radBranch = Angle.calcRadial(this.nodes[0], this.nodes[1]);
		let radPoint = Angle.calcRadial(this.nodes[0], point);
		let cmpAngle = Angle.diff(radBranch.angle, radPoint.angle);
		return {
			radBranch,//абсолютні радіальні координати branch
			radPoint,//абсолютні радіальні координати point
			cmpAngle,//кут point відносно branch
			height: Math.cos(cmpAngle) * radPoint.dist,
			width: Math.sin(cmpAngle) * radPoint.dist,
		};
	}

	distance(x,y){
		//відстань точки p до Branch, висота трикутника, для isNear
		const coords = this.calcCoords({x,y});
		return Math.abs(coords.width);
	}

	isNear(x,y){
		if(!this.rect.inRect(x,y))
			return false;
		return this.distance(x,y)<CURSOR_RADIUS;
	}

};

class Spline extends FigureItem{

	get array(){ return 'splines'; }

	constructor(ownerFigure,points){
		super(ownerFigure);

		points=points.map((point)=>{
			let res;
			switch (typeof point) {
				case 'object': res = point; break;
				case 'number': res = ownerFigure.points[point]; break;
				//case 'string': res = this.dotByName(dot); break;
			};
			return res;
		},this);

		this.points=points;//point0,point1
		this.prepare();
	}

	prepareRect(){
		this.rect.prepare(this.points);
	}

	prepare(){
		if(!this.rect)
			this.rect = new Rect();
		this.prepareRect();
		this.prepareInterimBezierPoints();
	}

	prepareInterimBezierPoints(){
		//масив проміжних точок для пошуку в isNear
		let newPoint=this.points[0];
		let c=0;
		for(let i=1; i<this.points.length; i++)
			c+=Angle.dist2D(this.points[i-1], this.points[i]);
		c=c/5;//4
		let res=[];
		res.push({x:newPoint.x, y:newPoint.y});//first control point
		for(let i=1; i<=c; i++){
			newPoint = findInterimBezierPoint(this.points, i/c);
			//newPoint.round();
			newPoint.x = Math.round(newPoint.x);
			newPoint.y = Math.round(newPoint.y);
			res.push(newPoint);
		};
		newPoint=this.points[this.points.length-1];
		res.push({x:newPoint.x, y:newPoint.y});//last control point
		this.interimBezierPoints=res;
		return res;
	}

	get pointIds(){
		let ids = this.points.map((point)=>{
			return this.ownFigure.points.indexOf(point);
		},this);
		return ids;
	}

	get controlPoint(){
		return [this.points[0], this.points[this.points.length-1]];
	}

	get leverPoint(){
		let arr=[];
		for(let i=1; i<this.points.length-1; i++)
			arr.push(this.points[i]);
		return arr;
	}

	get curves(){
		//find curves of spline:
		let spline_curves=[];
		let spline=this;
		this.ownFigure.curves.forEach( (curve)=>{
			if(curve.splines.indexOf(spline)>=0)
				spline_curves.push(curve);
		});
		return spline_curves;
	}

	isNear(x,y){
		if(!this.rect.inRect(x,y))
			return false;
		let points = this.interimBezierPoints;
		for(let i=0; i<points.length; i++)
			if(Angle.dist2D(points[i], {x, y})<5)
				return true;
		return false;
	}

};

class Curve extends FigureItem{

	get array(){ return 'curves'; }

	constructor(ownerFigure, splines=[]){
		super(ownerFigure);
		this.splines=splines;
		
	}

	get splineIds(){
		let ids = this.splines.map((spline)=>{
			return this.ownFigure.splines.indexOf(spline);
		},this);
		return ids;
	}

	isNear(x,y){
		//
	}

};

class Figure{

	static arrName(attr){
		let arr = attr+'s';
		if(attr=='branch')
			arr = attr+'es';
		return arr;
	}

	constructor(name=''){
		this.name=name;
		//this.rect = {x,y,w:0,h:0};
		this.rect = {cx:0, cy:0, width:0, height:0, angle:0};
		this.points = [];//Point
		this.rotors = [];//Rotor
		this.levers = [];//Lever
		this.nodes = [];//Node
		this.branches = [];//Branch
		this.splines = [];//Spline
		this.curves = [];//BezierCurve
		this.figures = [];//BezierFigure (and imported)
	}

	nameIndex(attr, name){
		let arr = Figure.arrName(attr);
		for(let i=0; i<this[arr].length; i++)
			if(this[arr][i].name===name)
				return i;
		return -1;
	}

	byIndex(attr, index){
		let arr = attr+'s';
		return this[arr][index];
	}

	byName(attr, name){
		let index=this.nameIndex(attr, name);
		return this.byIndex(attr, index);
	}

	point(name){//pointByName
		return this.byName('point', name);
	}

	rotor(name){
		return this.byName('rotor', name);
	}

	lever(name){
		return this.byName('lever', name);
	}

	node(name){
		return this.byName('node', name);
	}

	branch(name){
		return this.byName('branch', name);
	}

	spline(name){
		return this.byName('spline', name);
	}

	curve(name){
		return this.byName('curve', name);
	}

	figure(name){
		return this.byName('figure', name);
	}

	get center(){
		return {
			x:this.rect.cx,
			y:this.rect.cy,
		}
	}

	set center(value){
		this.rect.cx=value.x;
		this.rect.cy=value.y;
	}

	get rectBounds(){
		//межі фігури без урахування куту оберту
		const c=this.center;
		return {
			x0:c.x-this.rect.width/2,
			x1:c.x+this.rect.width/2,
			y0:c.y-this.rect.height/2,
			y1:c.y+this.rect.height/2,
		}
	}

	get rectPoints(){
		//кути меж фігури під кутом оберту
		const c=this.center;
		const b=this.rectBounds;
		let points=[
			{x:b.x0, y:b.y0},
			{x:b.x1, y:b.y0},
			{x:b.x1, y:b.y1},
			{x:b.x0, y:b.y1},
		];
		points.forEach(point=>{
			Angle.rotate2D(c,point,this.rect.angle)
		});

		return points;
	}

	isNear(x,y){
		let c=this.center;
		let p={x,y};//pointer
		Angle.rotate2D(c,p,-this.rect.angle);
		const b=this.rectBounds;
		return (b.x0<=p.x && p.x<=b.x1) && (b.y0<=p.y && p.y<=b.y1);
	}

	changeParamsCascade(delta={dx:0, dy:0, dw:1, dh:1, dangle:0}){//px, px, 100%, 100%, rad
		function changeParamsFor(figure){

			figure.rect.cx = old_center.x + (figure.rect.cx-old_center.x)*delta.dw;
			figure.rect.cy = old_center.y + (figure.rect.cy-old_center.y)*delta.dh;

			let figure_c=figure.center;
			Angle.rotate2D(old_center, figure_c, delta.dangle);
			figure.center = figure_c;

			figure.rect.cx+=delta.dx;
			figure.rect.cy+=delta.dy;
			//для перегорнутих фігур розміри мають бути також >0
			figure.rect.width*=Math.abs(delta.dw);
			figure.rect.height*=Math.abs(delta.dh);
			figure.rect.angle+=delta.dangle;

			figure.points.forEach(point=>{
				point.grow(old_center,delta.dw, delta.dh);
				point.rotate(old_center,delta.dangle);
				point.shift(delta.dx, delta.dy);
				point.round();
			});

			figure.nodes.forEach(node=>{
				node.grow(old_center,delta.dw, delta.dh);
				node.rotate(old_center,delta.dangle);
				node.shift(delta.dx, delta.dy);
				node.round();
			});

			figure.rotors.forEach(rotor=>{
				rotor.grow(old_center,delta.dw, delta.dh);
				rotor.rotate(old_center,delta.dangle);
				rotor.shift(delta.dx, delta.dy);
				rotor.round();
			});

			figure.levers.forEach(lever=>{
				lever.grow(old_center,delta.dw, delta.dh);
				lever.rotate(old_center,delta.dangle);
				lever.shift(delta.dx, delta.dy);
				lever.round();
			});

			figure.splines.forEach(spline=>{
				spline.prepare();
			});

			figure.branches.forEach(branch=>{
				branch.prepare();
			});

			figure.figures.forEach(figure=>changeParamsFor(figure));
		};
		let old_center=this.center;
		changeParamsFor(this);
	}

	setParamsCascade(params={cx:0,cy:0,width:0,height:0,angle:0}){
		//параметри лише для даної фігури, які впливають на підфігури
		//де, яких розмірів, під яким кутом буде ця фігура
		//params to delta
		let delta={
			dx : params.cx-this.rect.cx,//px
			dy : params.cy-this.rect.cy,//px
			dw : params.width/this.rect.width,//100%
			dh : params.height/this.rect.height,//100%
			dangle : params.angle-this.rect.angle,//rad
		};
		this.changeParamsCascade(delta);
	}

	shift(dx,dy, bCascade=true){
		if(bCascade){
			let delta={dx, dy, dw:1, dh:1, dangle:0,};
			this.changeParamsCascade(delta);
		}
		else{
			this.rect.cx+=dx;
			this.rect.cy+=dy;
			this.points.forEach(point=>point.shift(dx,dy));
			this.rotors.forEach(rotor=>rotor.shift(dx,dy));
			this.levers.forEach(lever=>lever.shift(dx,dy));
			this.nodes.forEach(node=>node.shift(dx,dy));
			this.splines.forEach(spline=>spline.prepare());
			this.branches.forEach(branch=>branch.prepare());
		}
	}

	round(bCascade=true){
		this.points.forEach(point=>point.round());
		this.rotors.forEach(rotor=>rotor.round());
		this.rotors.forEach(rotor=>rotor.angle.toFixed(3));//+
		this.levers.forEach(lever=>lever.round());
		this.nodes.forEach(node=>node.round());
		if(bCascade)
			this.figures.forEach(figure=>figure.round(bCascade));
	}

};

class Layer{

	constructor(){
		this.figures = [];//Figure (and imported)
	}

}


function findInterimPoint(dot1,dot2,coef){
	return {
		x: dot1.x + (dot2.x-dot1.x)*coef,
		y: dot1.y + (dot2.y-dot1.y)*coef,
	};
};

function findInterimBezierPoint(aDot, coef){//interim point
/*
		let aPnt=[{}, {},{}, {},{},{}, {},{},{},{}];
		aPnt[9]=aDot[3];
		aPnt[8]=aDot[2];
		aPnt[7]=aDot[1];
		aPnt[6]=aDot[0];

		aPnt[5]=middle(aPnt[8], aPnt[9], coef);
		aPnt[4]=middle(aPnt[7], aPnt[8], coef);
		aPnt[3]=middle(aPnt[6], aPnt[7], coef);

		aPnt[2]=middle(aPnt[4], aPnt[5], coef);
		aPnt[1]=middle(aPnt[3], aPnt[4], coef);

		aPnt[0]=middle(aPnt[1], aPnt[2], coef);
//wrapped code:*/
		let n=aDot.length;
		let i2=(n*n+n)/2;//10 6 3 1
		let i1=i2-n;//6 3 1 0
		let aPnt = new Array(i2);
		for(let i=0; i<n; i++)
			aPnt[i1+i]=aDot[i];
		for(let lvl=n-1; lvl>0; lvl--){//степень
			for(let j=lvl; j>0; j--){//точки
				i1--;
				aPnt[i1]=findInterimPoint(aPnt[i1+lvl], aPnt[i1+lvl+1], coef);
			};
		};

		return aPnt[0];
};


class Editor{
	constructor(owner){
		this.owner=owner;

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
		this.content.layers=[];
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

	addFigure(){
		this.curr.figure = new Figure();
		if(!this.curr.layer)
			this.curr.layer = this.content.layers[0];
		this.curr.layer.figures.push(this.curr.figure);
		return this.curr.figure;
	}

	copyFigure(original){
		//Додасть копію фігури original до поточної фігури або шару
		if(!original)
			return;

		const owner = this.curr.figure;
		const tmp_curr_figure = this.curr.figure;//!
		const copy = new Figure();
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

	find(arr, x,y){
		for(let index=0; index<arr.length; index++){
			let item=arr[index];//item may be point, rotor, spline, figure
			if(item.isNear(x,y))
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
					if(figure.isNear(x,y)){
						let pth=figure_path.map((el)=>{return el});
						choiced_pathes.push(pth);
					}

					figure.figures.forEach((sub_figure,index)=>{
						findSubFigure(sub_figure,index);
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

						newPoint = findInterimBezierPoint(points, i/c);
						newDist=dist(newDot,newPoint);

						while(newDist>=line_length){
							let distL = line_length-oldDist;
							let distR = newDist-line_length;
							oldDot = newDot;
							newDot = findInterimPoint(oldPoint, newPoint, distL/(distL + distR)/2 );
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
			newPoint = findInterimBezierPoint(aDot, i/c);
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
		if(!figure.rect)
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
