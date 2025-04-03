import Angle from './../../common/Angle.js';
import PixelColor from './PixelColor.js';

export default class CanvasRender{

	constructor(content, canvas=null){
		this.content=content;
		this.canvas=canvas;
		this.rectByCanvas();
		this.initSettings();
		this.curr={
			x:-1,
			y:-1,
			row:null,
		}
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

	initSettings(){
		this.settings={
		};
	}

	setting(name){
		return this.settings[name];
	}

	newRow(){
		return{};
	}

	row(y){
		let index = Math.round(y)-this.rect.top;
		if(index<0)
			index=0;
		if(index>=this.rows.length)
			index=this.rows.length-1;
		return this.rows[index];
	}

	newPixelColor(color){
		return new PixelColor(color);
	}

	prepare(){
		let rowCount = this.rect.bottom-this.rect.top+1;//this.canvas.height
		this.rows = new Array(rowCount);
		for(let i=0; i<this.rows.length; i++)
			this.rows[i]=this.newRow();
	}

	//methods for overriding:
	prepare_rows(){
		//prepares rows before circle
	}
	prepare_vert(y){
		//prepares elements of this.row(y)
	}
	prepare_horiz(x){
		//prepares elements of cell before color calculating
	}
	prepare_color(x,y){
		//color calculating
		let rgba=[0,0,0,255];
		return rgba;
	}


	paint(canvas=null, rect=null){
		if(canvas)
			this.canvas=canvas;

		if(rect)
			this.rect=rect;
		if(!this.rect)
			this.rectByCanvas();

		this.prepare();

		this.prepare_rows();
		for(let y=this.rect.top; y<=this.rect.bottom; y++){
			this.curr.y=y;
			this.curr.row=this.row(y);
			this.prepare_vert(y);
			for(let x=this.rect.left; x<=this.rect.right; x++){
				this.curr.x=x;
				this.prepare_horiz(x);
				let rgba = this.prepare_color(x,y);
				this.canvas.setRGB(x,y,rgba);
			};
		};

		if(this.canvas.put)
			this.canvas.put();
	}


	//context:

	paintEllipse(point, color, radius=1){
		this.canvas.paintEllipse(point, color, radius);
	}

	paintLine(points, color){
		this.canvas.paintLine(points, color);
	}

}
