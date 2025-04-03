import Angle from './../../../common/Angle.js';
import CanvasRender from './../../canvas/CanvasRender.js';
import Segment from './items/Segment.js';

import RowRender from './RowRender.js';


export default class PictureRender extends CanvasRender{

	initSettings(){
		super.initSettings();
		this.settings['bg-color']=[255,255,255,255];
		this.settings['line-color']=[0,0,0,255];
	}

	newRow(){
		return{
			links:[],
		};
	}

	addSegment(oldDot, newDot, spline){
		let segment = new Segment(oldDot, newDot);//line
		if(segment.delta.y==0 && segment.delta.x==0)
			return;
		if(!segment.dot1)
			return;
		if(!segment.inRect(this.rect))
			return;

		//segment.calcWidth(spline, coeff);
		segment.spline=spline;

		this.segments.push(segment);//?
		let link0 = segment.newLink(0);
		let link1 = segment.newLink(1);
		this.row(segment.top.y   ).links.push(link0);//link0.y
		this.row(segment.bottom.y).links.push(link1);//link1.y

		return segment;
	}

	prepareSegmentsByFigure(figure){
		if(!figure)
			return;

		figure.splines.forEach((spline, iSpline)=>{
			let points = spline.points;

			let c=0;
			for(let i=1; i<points.length; i++)
				c+=Angle.dist2D(points[i-1],points[i]);

			let oldPoint, newPoint=points[0];
			let oldDot, newDot=newPoint;
			let oldDist, newDist=0;
			let width0 = points[0].width;
			let width1 = points[ points.length-1 ].width
			let dots = spline.prepareInterimBezierPoints();

			dots.forEach((dot,i)=>{
				dot.width = Angle.grow(width0, width1, i/dots.length);
			});

			for(let i=1; i<dots.length; i++){
				this.addSegment(dots[i-1], dots[i], spline);
			};

		});//spline
	}

//----------

	prepareByFigure(iLayer, figure){
		if(!figure)
			return;
		this.prepareSegmentsByFigure(figure);
		figure.figures.forEach( (nested_figure, iNestedFigure)=>this.prepareByFigure(iLayer, nested_figure));
	}

	prepare_rows(){
		this.curr.segments=[];
		this.segments=[];
		this.crosses=[];

		//content to rows.links
		this.content.layers.forEach( (layer, iLayer)=>layer.figures.forEach( (figure, iFigure)=>this.prepareByFigure(iLayer, figure) ) );

		this.rowRender = new RowRender(this);
	}


//vertical preparation:

	addSegmentsOn(y){
		this.rows[y].links.forEach( (link, index)=> {
			if(link.top || link.left)
				this.curr.segments.push(link.segment);
			if(link.bottom){
				let iDel=this.curr.segments.indexOf(link.segment);
				if(iDel>=0)
					this.curr.segments.splice(iDel, 1);
			};
		});
	}

	deleteSegmentsAbove(y){
		this.rows[y].links.forEach((link, index)=>{
			if(link.right){
				let iDel=this.curr.segments.indexOf(link.segment);
				if(iDel>=0)
					this.curr.segments.splice(iDel, 1);
			};
		});
	}

	findCrosses(y){
		this.crosses = this.curr.segments.map((segment, index)=>{ return  segment.newCross(y)});
		this.crosses.sort((cross1,cross2)=>{ return cross1.x-cross2.x });

		//clean upper crosses:
		for (let i = this.crosses.length - 1; i >= 0; i--) {
			if(this.crosses[i].segment.bottom.y<y)
				this.crosses.splice(i,1);
		};
	}


	prepare_vert(y){
		//sort lines by y:
		this.rows[y].links.sort((link1,link2)=>{ return link1.x-link2.x});

		//adding of curr segments:
		this.addSegmentsOn(y);

		//find crosses by row y
		this.findCrosses(y);

		//row_splines and row_curves to row_areas
		this.rowRender.putCrosses(this.crosses, y);

		//deleting of old curr segments:
		this.deleteSegmentsAbove(y);
	}

//-----------

	prepare_horiz(x){
		this.rowRender.select_areas(x);
	}

	prepare_color(x,y){
		return this.rowRender.prepare_color(x,y);
	}

	//context:

	paintFigureRect(figure, color){
		if(!figure.rect)
			return;
		let points = figure.rectPoints;
		points.push(points[0]);
		this.paintLine(points, color);
	}

};
