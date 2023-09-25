import Angle from './../../../common/Angle.js';

export default class Figure{

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

	isNear(x,y,CURSOR_RADIUS=0){
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
