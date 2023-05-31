import Arrow from './../../common/Arrow.js'
import PixelColor from './PixelColor.js'


class CustomCanvas {

	static newImage(src){
		let img = new Image();
		//canvas.crossOrigin = 'anonymous';//?
		img.src = src;//'images/units/man.bmp';
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
		//if (this.pointSect(x,y)!=8) return;
		let i = (y*this.width+x) * 4;
		//this.imageData.data.splice(i, 4, rgba);
		for(let j=0; j<4; j++)
		this.data[i+j]=rgba[j];//rgba=[r,g,b,a]//.imageData.data[i+j]
		//console.log(x, y, i, rgba[0], this.imageData.data[i+0]);

	}

	getRGB(x,y){
		x=Math.round(x);
		y=Math.round(y);
		//if (this.pointSect(x,y)!=8) return [0,0,0,0];
		let rgba=[];
		let i = (y*this.width+x) * 4;
		//this.imageData.data.splice(i, 4, rgba);
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



	paintRect(x,y,w,h,rgba){//+16.7.21
		for(let i=0; i<h; i++)
			for(let j=0; j<w; j++)
				this.setRGB(x+j, y+i, rgba);
	}


	applMap(x,y, cm){//(x,y, ColorMap cm)
		let h=cm.height;
		let w=cm.width;
		console.log('applMap',h,w, x, y);
		for(let i=0; i<h; i++)
			for(let j=0; j<w; j++){
				//let rgba=cm.getRGB(j,i);
				//this.setRGB(x+j, y+i, rgba);
			
				//if (i>5 && i<15 && j>10 && j<30)
				//console.log(x,j,y,i,rgba, this.getRGB(x+j, y+i));//rgba
				this.setRGB(x+j, y+i, cm.getRGB(j,i));
			}
	}

	applMapFast(x,y, cm){//(x,y, ColorMap cm)
		let h=cm.height;
		let w=cm.width;
		for(let i=0; i<h; i++){
			let i0= ((y+i)*this.width+x) * 4;
			let i1= i*w*4;
			for(let j=0; j<w*4; j++)
				//this.setRGB(x+j, y+i, cm.getRGB(j,i));
				//this.data[ i0 + j ] = cm.data[ i1 + j ];
				this.data[ i0++ ] = cm.data[ i1++ ];
		};
	}



	appl(cm, kuda={}, from={}){//(x,y, ColorMap cm)


		if(kuda=={}){
			kuda.x=0;
			kuda.y=0;
		};

		if(from=={}){
			from.x=0;
			from.y=0;
		};
		if(!from.w)from.w=cm.width;
		if(!from.h)from.h=cm.height;

		let h=from.h;
		let w=from.w;

		for(let i=0; i<h; i++)
			for(let j=0; j<w; j++)
				this.setRGB(kuda.x+j, kuda.y+i, cm.getRGB(from.x+j,from.y+i));
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


	clone(from={}){
		if(from=={}){
			from.x=0;
			from.y=0;
		};
		if(from.w)from.w=cm.width;
		if(from.h)from.h=cm.height;

		let h=from.h;
		let w=from.w;

		let kuda={x:0,y:0};

		let cm = new VirtualCanvas(h,w);
		cm.appl(this, kuda, from);
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


	clone(from={}){
		if(from=={}){
			from.x=0;
			from.y=0;
		};
		if(from.w)from.w=cm.width;
		if(from.h)from.h=cm.height;

		let h=from.h;
		let w=from.w;

		let kuda={x:0,y:0};

		let cm = new VirtualCanvas(h,w);
		cm.appl(this, kuda, from);
		return cm;
	}


	put(){
		this.ctx.putImageData(this.imageData,0,0);
	}


	applImage(img,kuda){
		console.log('kuda:');
		console.log(kuda);
		this.ctx.drawImage(img, kuda.x, kuda.y);//?//, kuda.w, kuda.h);
	}


}


export { CustomCanvas, VirtualCanvas, RealCanvas };
