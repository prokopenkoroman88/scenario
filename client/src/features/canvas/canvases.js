import Arrow from './../../common/Arrow.js'
import PixelColor from './PixelColor.js'


class CustomCanvas {

	static newImage(src){
		let img = new Image();
		//canvas.crossOrigin = 'anonymous';//?
		img.src = src;
		return img;
	}

	constructor(){
		this.height=0;
		this.width=0;
		this.data = null;//new Uint8ClampedArray(this.height*this.width*4);
	}

	resize(height,width){
		this.height=height;
		this.width=width;
	}

	pointSect(x,y){
		if (x<0) x=-1;
		else 
			if (x>=this.width) x=1;
			else
				x=0;

		if (y<0) y=-1;
		else 
			if (y>=this.height) y=1;
			else
				y=0;

		return Arrow.pointSect[y+1][x+1];
		//aWindRose
	}

	setRGB(x,y,rgba){
		x=Math.round(x);
		y=Math.round(y);
		if (this.pointSect(x,y)!=8) return;
		let i = (y*this.width+x) * 4;
		for(let j=0; j<4; j++)
			this.data[i+j]=rgba[j];
	}

	getRGB(x,y){
		x=Math.round(x);
		y=Math.round(y);
		if (this.pointSect(x,y)!=8) return [0,0,0,0];
		let rgba=[];
		let i = (y*this.width+x) * 4;
		for(let j=0; j<4; j++)
			rgba.push(this.data[i+j]);//rgba=[r,g,b,a]
		return rgba;
	}

	setPixel(x,y,pixel){
		this.setRGB(x,y,pixel.toArray());
	}

	getPixel(x,y){
		let rgba=this.getRGB(x,y);
		return new PixelColor(rgba);
	}



	paintRect(x,y,w,h,rgba){
		for(let i=0; i<h; i++)
			for(let j=0; j<w; j++)
				this.setRGB(x+j, y+i, rgba);
	}


	applMap(x,y, cm){
		let h=cm.height;
		let w=cm.width;
		for(let i=0; i<h; i++)
			for(let j=0; j<w; j++){
				this.setRGB(x+j, y+i, cm.getRGB(j,i));
			}
	}

	applMapFast(x,y, cm){
		let h=cm.height;
		let w=cm.width;
		for(let i=0; i<h; i++){
			let i0= ((y+i)*this.width+x) * 4;
			let i1= i*w*4;
			for(let j=0; j<w*4; j++)
				this.data[ i0++ ] = cm.data[ i1++ ];
		};
	}



	appl(cm, to={x:0, y:0}, from={x:0, y:0}){
		if(!from.w)from.w=cm.width;
		if(!from.h)from.h=cm.height;

		let h=from.h;
		let w=from.w;

		for(let i=0; i<h; i++)
			for(let j=0; j<w; j++)
				this.setRGB(to.x+j, to.y+i, cm.getRGB(from.x+j,from.y+i));
	}




}//class CustomCanvas



class VirtualCanvas extends CustomCanvas{

	constructor(height,width){
		super();
		this.init(height,width);
	}

	init(height,width){
		this.resize(height,width);
	}


	resize(height,width){
		super.resize(height,width);
		this.data = new Uint8ClampedArray(this.height*this.width*4);
		//Uint8ClampedArray()
		//https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray/Uint8ClampedArray
		// polifill: https://github.com/zloirock/core-js#ecmascript-typed-arrays
	}


	clone(from={x:0, y:0}){
		if(from.w)from.w=cm.width;
		if(from.h)from.h=cm.height;

		let h=from.h;
		let w=from.w;

		let to={x:0,y:0};

		let cm = new VirtualCanvas(h,w);
		cm.appl(this, to, from);
		return cm;
	}

}



class RealCanvas extends CustomCanvas{

	constructor(canvas){
		super();
		this.init(canvas);
	}

	init(canvas){
		this.setCanvas(canvas);
		this.ctx = this.canvas.getContext('2d');
		super.resize(this.canvas.height,this.canvas.width);
		this.refreshImageData();
	}

	setCanvas(canvas){
		if(typeof canvas === 'object'){
			this.canvasRef = canvas;
			this.canvas = this.canvasRef.current;
			if(canvas.constructor.name=='HTMLCanvasElement')
				this.canvas=canvas;
		}
		else
		if(typeof canvas === 'string'){
			this.canvasSel = canvas;//selector
			if(!this.canvasSel){
				this.canvas=document.createElement('canvas');
				this.canvas.setAttribute('width',320);
				this.canvas.setAttribute('height',320);
				//?document.body.append(this.canvas);
				console.log(this.canvas);
			}
			else
				this.canvas=document.querySelector(this.canvasSel);
		};
	}

	resize(height,width){
		super.resize(height,width);
		this.canvas.height=height;
		this.canvas.width=width;
		this.refreshImageData();
	}


	refreshImageData(){
		this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		this.data=this.imageData.data;
	}


	clone(from={x:0, y:0}){
		if(from.w)from.w=cm.width;
		if(from.h)from.h=cm.height;

		let h=from.h;
		let w=from.w;

		let to={x:0,y:0};

		let cm = new VirtualCanvas(h,w);
		cm.appl(this, to, from);
		return cm;
	}


	put(){
		this.ctx.putImageData(this.imageData,0,0);
	}


	applImage(img,to){
		this.ctx.drawImage(img, to.x, to.y);//?//, to.w, to.h);
	}


	//context:

	stroke(color){
		let strokeStyle = this.ctx.strokeStyle
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
		this.ctx.strokeStyle = strokeStyle;
	}

	paintEllipse(point, color, radius=1){
		if(!point)
			return;
		this.ctx.beginPath();
		this.ctx.arc(point.x, point.y, radius, 0, Math.PI*2, true);
		this.stroke(color);
	}

	paintLine(points, color){
		if(!points || points.length<2)
			return;
		if(!points[0])
			return;
		this.ctx.beginPath();
		this.ctx.moveTo(points[0].x, points[0].y);
		for(let i=1; i<points.length; i++)
			this.ctx.lineTo(points[i].x, points[i].y);
		this.stroke(color);
	}

}


export { CustomCanvas, VirtualCanvas, RealCanvas };
