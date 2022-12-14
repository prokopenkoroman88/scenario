
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

class Point extends FigureItem{

	get array(){ return 'points'; }

	constructor(ownerFigure,x,y){
		super(ownerFigure);
		this.x = x;
		this.y = y;
		this.width = 1;
		this.color = '#000';
	}

	shift(dx,dy){
		this.x+=dx;
		this.y+=dy
	}

	distance(x,y){
		return distance(this.x, this.y, x, y);// Math.sqrt(Math.pow(x-this.x,2) + Math.pow(y-this.y,2));
	}

	isNear(x,y){
		return (this.distance(x,y)<5);
	}

};

class Rotor extends Point {

	get array(){ return 'rotors'; }

	constructor(ownerFigure,x,y,angle=0){
		super(ownerFigure,x,y);
		this.angle = angle;
		this.points = [];
		this.rotors = [];//?
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
		let oldPoint, newPoint=this.points[0];
		let c=0;
		for(let i=1; i<this.points.length; i++)
			c+=this.points[i-1].distance(this.points[i].x,this.points[i].y);
		c=c/5;//4
		//=Math.hypot(aDot);//
		for(let i=1; i<=c; i++){
			if(distance(newPoint.x, newPoint.y, x, y)<5)
				return true;
			oldPoint = newPoint;
			newPoint = findInterimBezierPoint(this.points, i/c);
		};///i++
		return false;
	}

};

class Curve extends FigureItem{

	get array(){ return 'curves'; }

	constructor(ownerFigure){
		super(ownerFigure);
		this.splines=[];
		
	}

	isNear(x,y){
		//
	}

};

class Figure{

	constructor(name=''){
		this.name=name;
		//this.rect = {x,y,w:0,h:0};
		this.points = [];//Point
		this.rotors = [];//Rotor
		this.splines = [];//Spline
		this.curves = [];//BezierCurve
		this.figures = [];//BezierFigure (and imported)
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
		for(let lvl=n-1; lvl>0; lvl--){//??????????????
			for(let j=lvl; j>0; j--){//??????????
				i1--;
				aPnt[i1]=findInterimPoint(aPnt[i1+lvl], aPnt[i1+lvl+1], coef);
			};
		};

		return aPnt[0];
};


class Editor{
	constructor(owner){
		this.owner=owner;

		this.curr={
			point:null,
			rotor:null,
			spline:null,
		};

		this.found={
			point:-1,
		};
	}

	get content(){ return this.owner.content; }

	addPoint(x,y){
		this.curr.point = new Point(this.curr.figure, x,y);
		this.curr.figure.points.push(this.curr.point);
		return this.curr.point;
	}

	addRotor(x,y){
		this.curr.rotor = new Rotor(this.curr.figure, x,y);
		this.curr.figure.rotors.push(this.curr.rotor);
		return this.curr.rotor;
	}

	preparePoints(points){
		points=points.map((point)=>{
			let res;
			switch (typeof point) {
				case 'object': {
					if(point.ownFigure)
						res = point;//by Point
					else {
						let id = -1;
						//if(this.needFind)
							id = this.curr.figure.findPointByCoords(point.x, point.y).point;//by {x,y}
						if(id>=0)
							res = this.curr.figure.points[id];//find
						else
							res = this.addPoint(point.x, point.y);//new
					};
				}; break;
				case 'number': res = this.curr.figure.points[point]; break;//by id
				//case 'string': res = this.curr.figure.pointByName(point); break;
			};
			return res;
		},this);
		return points;
	}

	addSpline(points){//objs or ids or {x,y}
		points = this.preparePoints(points);
		this.curr.spline = new Spline(this.curr.figure, points);//newPoint==this.currPoint
		this.curr.figure.splines.push(this.curr.spline);
		if(this.curr.curve)
			this.curr.curve.splines.push(this.curr.spline);
		return this.curr.spline;
	}

	addCurve(){
		this.curr.curve = new Curve(this.curr.figure);
		if(!this.curr.figure){
			if(!this.curr.layer)
				this.curr.layer = this.content.layers[0];
			this.curr.figure = this.curr.layer.figures[0];
		};
		this.curr.figure.curves.push(this.curr.curve);
		return this.curr.curve;
	}

	addFigure(){
		this.curr.figure = new Figure();
		if(!this.curr.layer)
			this.curr.layer = this.content.layers[0];
		this.curr.layer.figures.push(this.curr.figure);
		return this.curr.figure;
	}

	addLayer(){
		this.curr.layer = new Layer();
		this.content.layers.push(this.curr.layer);
		return this.curr.layer;
	}

	findByCoords(attrName,x,y){
		//attrName in ['point', 'rotor', 'spline']

		let arrName=attrName+'s';
		let isNear=false;
		this.found[attrName] = -1;
		//this.found.point = -1;
		//this.found.rotor = -1;
		//this.found.spline = -1;
		//this.found.curve = -1;//?
		this.found.figure = -1;
		this.found.layer = -1;

		this.content.layers.forEach( function(layer, iLayer) {

			layer.figures.forEach( function(figure, iFigure) {

				function findBy(arrName){
					figure[arrName].forEach( function(item, index) {
						isNear=item.isNear(x,y);
						if (isNear){
							this.found[attrName]=index;
							return;
						};
					},this);
				};
				findBy.bind(this)(arrName);
				//findBy.bind(this)('points');
				//findBy.bind(this)('rotors');
				//findBy.bind(this)('splines');
				//findBy.bind(this)('curves');

				if (isNear){
					this.found.figure=iFigure;
					return;
				};
				// statements
			},this);
			if (isNear){
				this.found.layer=iLayer;
				return;
			};
			// statements
		},this);
		return this.found;

	}

};


class Render{
	constructor(owner, canvas=null){
		this.owner=owner;
		this.canvas=canvas;
	}

	get content(){ return this.owner.content; }

	paint(canvas=null, rect=null){
		if(canvas)
			this.canvas=canvas;

		if(!rect)
			rect={
				top:0,
				bottom:this.canvas.height-1,
				left:0,
				right:this.canvas.width-1,
			};

		this.prepare();
		for(let y=rect.top; y<=rect.bottom; y++){
			this.prepare_vert(y);
			for(let x=rect.left; x<=rect.right; x++){
				this.prepare_horiz(x);
				let rgba = this.prepare_color(x,y);
				this.canvas.setRGB(x,y,rgba);
			};//x++
		};//y++
		this.canvas.put();
	}

	prepare(){
		function dist(p1,p2){
			return distance(p1.x,p1.y, p2.x,p2.y);
		};

		this.rows = new Array(this.canvas.height);
		for(let i=0; i<this.rows.length; i++)
			this.rows[i]={
				lines:[],
			};
		this.currLines=[];
		const line_length=10;

		this.content.layers.forEach( (layer, iLayer) => {
			layer.figures.forEach( (figure, iFigure) => {
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
							line.spline=spline;
							let width=spline.controlPoint[0].width + (spline.controlPoint[1].width-spline.controlPoint[0].width)*coeff;
							let sin = Math.sin(Math.atan2(line.dot2.y-line.dot1.y, line.dot2.x-line.dot1.x));
							if(Math.abs(sin)<=0.1)
								line.width_x = width + Math.abs( line.dot2.x-line.dot1.x );
							else
								line.width_x = width / Math.abs( sin );

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
				this.row_curves.splice(iCurve, 1);//???? ????????'???????????? ????????
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

};


class Bezier{

	constructor(canvas=null){
		this.canvas=canvas;
		this.content = {
			layers : [],
		};
		this.editor = new Editor(this);
		this.render = new Render(this);
	}

	paint(){
		this.render.paint(this.canvas);
	}

};


export { Bezier };
