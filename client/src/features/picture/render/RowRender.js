import Angle from './../../../common/Angle.js';


class RowSpline{

	constructor(cross){
		this.splines=[cross.segment.spline];
		this.left_x=cross.left_x;
		this.right_x=cross.right_x;
		this.begin=cross.segment.top.x - cross.segment.bottom.x;//?
		this.end=NaN;
		this.spline_curves=cross.segment.spline.curves;
		this.crosses=[cross];//for debug
	}

	get x(){return (this.right_x+this.left_x)/2}

};


class RowCurve{

	constructor(curve){
		this.curve=curve;
	}

	open(row_spline){
		this.left_spline=row_spline;
		this.left_x=row_spline.right_x;
	}

	close(row_spline){
		this.right_spline = row_spline;
		this.right_x = row_spline.left_x;
	}

};


export default class RowRender{

	constructor(owner){
		this.owner=owner;//PictureRender
		this.clear();
	}

	clear(){
		this.row_splines=[];
		this.row_curves=[];
		this.row_areas=[];
		this.iArea=-1;
		this.curr_areas=[];
	}


	//prepare_splines:

	splineIndex(spline){
		if(!this.row_splines.length)
			return -1;
		for(let i=this.row_splines.length-1; i>=0; i--)//з кінця, зі свіжих
			if(this.row_splines[i].splines.indexOf(spline)>-1)// && !this.row_splines[i].end
				return i;
		return -1;
	}

	addSpline(cross){
		let row_spline=new RowSpline(cross);
		this.row_splines.push(row_spline);
	}

	isCrossNear(iSpline, cross){
		let row_spline = this.row_splines[iSpline];
		return ((row_spline.right_x - cross.left_x)>-0.6);
	}

	editSpline(iSpline, cross){
		let row_spline = this.row_splines[iSpline];
		if(cross.right_x>row_spline.right_x)
			row_spline.right_x=cross.right_x;
		if(cross.left_x<row_spline.left_x)
			row_spline.left_x=cross.left_x;//?
		row_spline.end = cross.segment.top.x - cross.segment.bottom.x;
		row_spline.crosses.push(cross);//for debug
	}

	prepare_splines(){
		let sCrosses='CRSs:';
		this.row_splines=[];
		for(let iCross=0; iCross<this.crosses.length; iCross++){
			let cross=this.crosses[iCross];
			let segment=cross.segment;
			let spline=segment.spline;
			//sCrosses+=` (${cross.left_x}-${cross.right_x}),`;
			//let spline_curves = spline.curves;//cross.segment.spline.curves;
			let iSpline = this.splineIndex(spline);
			if(iSpline<0)
				this.addSpline(cross);
			else
				if(this.isCrossNear(iSpline, cross))
					this.editSpline(iSpline, cross)
				else
					this.addSpline(cross);
		};//iCross++
		//console.log(sCrosses);
	}


	//merge_splines:

	calcAxeDifference(last_dots, curr_dots){
		for(let jLast=0; jLast<2; jLast++)
			for(let jCurr=0; jCurr<2; jCurr++)
				//if(last_dots[jLast]==curr_dots[jCurr]){//dot1 == dot2
				if(last_dots[jLast].x==curr_dots[jCurr].x && last_dots[jLast].y==curr_dots[jCurr].y){//dot1 == dot2
					/*
					let lastDY=last_dots[jLast].y-last_dots[1-jLast].y;
					let currDY=curr_dots[1-jCurr].y-curr_dots[jCurr].y;
					let res=lastDY*currDY
					if(res==0){
						let lastDX=last_dots[jLast].x-last_dots[1-jLast].x;
						let currDX=curr_dots[1-jCurr].x-curr_dots[jCurr].x;
						res=lastDX*currDX;
					};
					return res>=0;
					//*/
					//*
					let lastAngle = Angle.angle(last_dots[1-jLast]  , last_dots[jLast]  );
					let currAngle = Angle.angle(curr_dots[jCurr]  , curr_dots[1-jCurr]  );
					let difference = Math.abs(Angle.add(lastAngle,-currAngle));
					return difference<(Math.PI/2);
					//*/
				};
	}


	isCoaxial(last_row_spline, curr_row_spline){
		let last_segments = last_row_spline.crosses.map(cross=>cross.segment);
		let curr_segments = curr_row_spline.crosses.map(cross=>cross.segment);
		for(let iLast=0; iLast<last_segments.length; iLast++)
			for(let iCurr=0; iCurr<curr_segments.length; iCurr++){
				let last_dots=[last_segments[iLast].dot1, last_segments[iLast].dot2];
				let curr_dots=[curr_segments[iCurr].dot1, curr_segments[iCurr].dot2];
				let difference = this.calcAxeDifference(last_dots, curr_dots);
				if(difference!==undefined)
					return difference;
			};
		return false;
	}

	mergeSplines(last_row_spline,curr_row_spline){
		last_row_spline.splines=[
			...last_row_spline.splines,
			...curr_row_spline.splines,
		];
		last_row_spline.crosses=[//debug
			...last_row_spline.crosses,
			...curr_row_spline.crosses,
		];
		curr_row_spline.spline_curves.forEach(spline_curve=>{
			if(last_row_spline.spline_curves.indexOf(spline_curve)<0)
				last_row_spline.spline_curves.push(spline_curve);
		});
		last_row_spline.left_x = Math.min(last_row_spline.left_x, curr_row_spline.left_x);
		last_row_spline.right_x = Math.max(last_row_spline.right_x, curr_row_spline.right_x);
		// console.log('merged', last_row_spline);
	}

	merge_splines(){
		if(this.row_splines.length<=1)
			return;
		for(let iSpline=this.row_splines.length-1; iSpline>0; iSpline--){
			let curr_row_spline=this.row_splines[iSpline];
			let last_row_spline=this.row_splines[iSpline-1];
			if(last_row_spline.right_x>=curr_row_spline.left_x){
				// console.log('row_splines:', this.row_splines.length );
				// this.row_splines.forEach((spl, index)=>{
				// 	console.log('spl[', index,'] ', spl.left_x, spl.right_x)
				// })
				// console.log('last.right_x>=curr.left_x', last_row_spline.right_x,'>=',curr_row_spline.left_x);
				//коли накладаються сегменти з різних сплайнів,
				if(this.isCoaxial(last_row_spline,curr_row_spline)){
					// які є продовженням одне одного
					this.mergeSplines(last_row_spline,curr_row_spline)
					this.row_splines.splice(iSpline, 1);
				};
			};
		};
	}


	//prepare_curves:

	curveIndex(curve){
		if(!this.row_curves.length)
			return -1;
		for(let i=this.row_curves.length-1; i>=0; i--)//з кінця, зі свіжих
			if(this.row_curves[i].curve==curve && !this.row_curves[i].right_spline)
				return i;
		return -1;
	}

	openCurve(row_spline, curve){
		let row_curve = new RowCurve(curve);
		row_curve.open(row_spline);
		this.row_curves.push(row_curve);
	}

	closeCurve(row_spline, iCurve){
		if(iCurve<0)
			iCurve+=this.row_curves.length;
		let row_curve = this.row_curves[iCurve];
		row_curve.close(row_spline);
	}

	prepare_curves(){
		this.row_curves=[];
		this.row_splines.forEach(row_spline=>{
			//let spline = row_spline.spline;
			//let spline_curves = spline.curves;
			let spline_curves = row_spline.spline_curves;//merged
			//
			spline_curves.forEach((spline_curve)=>{
				let iCurve = this.curveIndex(spline_curve);
				if(iCurve<0){
					this.openCurve(row_spline,spline_curve);
				}
				else{
					this.closeCurve(row_spline,iCurve);
				}
			});
		});
	}


	//prepare_areas:

	addArea(kind, side, item, x){
		this.row_areas.push({kind, side, item, x})
	}

	prepare_areas(){
		//this.row_splines & this.row_curves to this.row_areas
		this.row_areas=[];

		this.row_splines.forEach(row_spline=>{
			this.addArea('spline', 'begin', row_spline.spline, row_spline.left_x);
			this.addArea('spline', 'end'  , row_spline.spline, row_spline.right_x);
		});
		this.row_curves.forEach(row_curve=>{
			this.addArea('curve', 'begin', row_curve.curve, row_curve.left_x);
			this.addArea('curve', 'end'  , row_curve.curve, row_curve.right_x);
		});

		this.row_areas.sort((area1, area2)=>area1.x-area2.x);
	}

	putCrosses(crosses, y){
		this.clear();

		this.crosses=crosses;
		this.crosses.sort((cross1, cross2)=>cross1.x-cross2.x);

		this.prepare_splines();
		//this.row_splines are ready

		this.merge_splines();
		//this.row_splines are merged

		this.prepare_curves();
		//this.row_curves are ready

		this.prepare_areas();
		//this.row_areas are ready

		this.iArea=-1;
		this.curr_areas=[];

/*
		if(this.row_areas.length){
			console.log('row_splines', y, this.row_splines);
			console.log('row_curves', y, this.row_curves);
			console.log('row_areas', y, this.row_areas);
		};
//*/
	}

	select_areas(x){
		let i;
		do{
			i = this.iArea+1;
			if(i<this.row_areas.length && this.row_areas[i].x<=x){
				this.iArea=i;
				switch (this.row_areas[i].side) {
					case 'begin':
						this.curr_areas.push({
							kind:this.row_areas[i].kind,//'spline', 'curve'
							item:this.row_areas[i].item,
						});
						break;
					case 'end':
						for(let iDel=this.curr_areas.length-1; iDel>=0; iDel--){
							if(this.curr_areas[iDel].item==this.row_areas[i].item){
								this.curr_areas.splice(iDel, 1);
								break;
							}
						};
						break;
					default:
						break;
				}
			}

		} while (i<this.row_areas.length && this.row_areas[i].x<=x);
		//this.curr_areas are ready - stack for colors
	}

	getAreaColor(area, x,y){
		let rgba=[];
		switch (area.kind) {
			case 'spline':
				let spline = area.item;
				//rgba=spline.points[0].color;//?
				rgba=this.owner.setting('line-color');
				break;
			case 'curve':
				let curve = area.item
				rgba=curve.color;
				break;
			default:
				break;
		}
		return rgba;
	}

	get_last_color(x,y){
		let areas = this.curr_areas;
		let rgba=this.owner.setting('bg-color');
		if(areas.length)
			rgba = this.getAreaColor( areas[areas.length-1], x,y );
		return rgba;
	}

	applicate_all_colors(x,y){
		//first color from background
		let color = this.owner.newPixelColor(this.owner.setting('bg-color'));

		for(let i=0; i<this.curr_areas.length; i++){
			let area = this.curr_areas[i];
			let rgba = this.getAreaColor(area, x,y);
			color.mix(rgba);
		};
		let rgba = color.toArray();
		return rgba;
	}

	prepare_color(x,y){
		let rgba=this.owner.setting('bg-color');

		rgba = this.get_last_color(x,y);
//		rgba = this.applicate_all_colors(x,y);

		//nothing?
		if(!rgba)
			rgba=[255,255,255,255];

		return rgba;
	}

}
