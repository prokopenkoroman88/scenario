import Angle from './../../../common/Angle.js';
import Arrow from './../../../common/Arrow.js';
import FigureContainer from './custom/FigureContainer.js';

export default class Figure extends FigureContainer{

	constructor(name=''){
		super(name);
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

	figureEx(names=[]){
		return this.byNames('figure', names);
	}

	indexByName(name, attrNames='point rotor lever node branch spline curve'){
		const attrs=attrNames.split(' ');
		let res={};
		attrs.forEach(attr=>{
			let index = this.byName(attr, name);
			if(index>=0)
				res[attr] = index;
		});
		return res;//{point:1}
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

	//для перегорнутих фігур розміри мають бути також >0
	get width(){
		return Math.abs(this.rect.width)
	}
	get height(){
		return Math.abs(this.rect.height)
	}

	get rectBounds(){
		//межі фігури без урахування куту оберту та від'ємності розмірів
		const c=this.center;
		return {
			x0:c.x-this.width/2,//.rect
			x1:c.x+this.width/2,//.rect
			y0:c.y-this.height/2,//.rect
			y1:c.y+this.height/2,//.rect
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
		return (b.x0-CURSOR_RADIUS<=p.x && p.x<=b.x1+CURSOR_RADIUS) && (b.y0-CURSOR_RADIUS<=p.y && p.y<=b.y1+CURSOR_RADIUS);
	}

	calcBorderLook(x,y,CURSOR_RADIUS=0){
		let c=this.center;
		let p={x,y};//pointer
		Angle.rotate2D(c,p,-this.rect.angle);
		const b=this.rectBounds;

		let j=1, i=1;
		//  -1      0      1      2       3
		//  out   border  fig   border   out
		if(p.x<b.x0-CURSOR_RADIUS)
			j=-1
		else if(p.x<b.x0+CURSOR_RADIUS)
			j=0
		else if(p.x<b.x1-CURSOR_RADIUS)
			j=1
		else if(p.x<=b.x1+CURSOR_RADIUS)
			j=2
		else
			j=3;
		if(j<0 || j>2)
			return -1;//out

		if(p.y<b.y0-CURSOR_RADIUS)
			i=-1
		else if(p.y<b.y0+CURSOR_RADIUS)
			i=0
		else if(p.y<b.y1-CURSOR_RADIUS)
			i=1
		else if(p.y<=b.y1+CURSOR_RADIUS)
			i=2
		else
			i=3;
		if(i<0 || i>2)
			return -1;//out

		let look = Arrow.pointSect[i][j];
		return look;
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
			//для перегорнутих фігур розміри залишаються <0
			figure.rect.width*=delta.dw;
			figure.rect.height*=delta.dh;
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
		if(!this.rect.width)
			this.rect.width=1;
		if(!this.rect.height)
			this.rect.height=1;
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
		if(this.params){
			//if the figure is integrated
			this.params.cx+=dx;
			this.params.cy+=dy;
		}
	}

	resize(dx,dy, look, bCascade=true){
		//переделать: только рамку, рамку с собств айтемами, каскадом со всеми подфигурами
		let c=this.center;
		let p={x:dx,y:dy};//pointer
		Angle.rotate2D({x:0, y:0}, p, -this.rect.angle);

		if(bCascade){
			let signW = Math.sign(this.rect.width);
			let signH = Math.sign(this.rect.height);
			let params={
				cx:this.rect.cx+dx/2,
				cy:this.rect.cy+dy/2,
				width:(this.rect.width + Arrow.step(look).dx * p.x*signW),
				height:(this.rect.height + Arrow.step(look).dy * p.y*signH),
				angle:this.rect.angle,
			};
			this.setParamsCascade(params);
		}
		else{
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
