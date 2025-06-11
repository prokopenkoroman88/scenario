export default class PixelColor {
	r;
	g;
	b;
	a=255;
	constructor(color){

		let rgba=PixelColor.colorToArray(color);
		this.fromArray(rgba);
	}

	static colorToArray(color){
		if(Array.isArray(color)){
			if(color.length == 3 || color.length == 4 ){
				return color;
			}
		}
		else{
			if(color.charAt(0)!='#'){
				//https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes/24390910
				let ctx = document.createElement("canvas").getContext("2d");
				ctx.fillStyle = color;//>=Edge9.0
	 			color = ctx.fillStyle;//'DodgerBlue'  =>  '#1e90ff'
	 		};
			return PixelColor.encodeColor(parseInt(color.substring(1,3),16), parseInt(color.substring(3,5),16), parseInt(color.substring(5,7),16));
		};

	}



	static  normByte(value){
		if(value<0) return 0;
		if(value>255) return 255;
		return value;
	}

	static encodeColor(r,g,b,a=255){
		return [
			PixelColor.normByte(r),
			PixelColor.normByte(g),
			PixelColor.normByte(b),
			PixelColor.normByte(a)
		];
	}

	encodeColor(r,g,b,a=255){
		this.fromArray(PixelColor.encodeColor(r,g,b,a));
		//console.log(this);
		return this;
	}

// (r,g,b,a) [r,g,b,a] {r,g,b,a} '#rrggbb'?  'rgba(,,,)'

	inverse(){
		this.r=255-this.r;
		this.g=255-this.g;
		this.b=255-this.b;
		return this;
	}

	toColor(){
		function toHex(num){
			let s=num.toString(16);
			if(num<16)
				s='0'+s;
			return s;
		};
		return '#'+toHex(this.r)+toHex(this.g)+toHex(this.b);
	}

	toRGB(bOpacity=false){
		if(bOpacity)
			return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')'
		else
			return 'rgb('+this.r+','+this.g+','+this.b+')';
	}

	toHSL(){
		return 'hsl('
			+(this.getHue()/Math.PI*180).toFixed(0)+'deg,'
			+(this.getContrast()*100).toFixed(1)+'%,'
			+(this.getBrightness()*100).toFixed(1)+'%'
		+')';
	}

	toArray(){
		return [this.r, this.g, this.b, this.a];
	}

	fromArray(rgba){
		if(rgba.length == 3 || rgba.length == 4 ){
			this.r=PixelColor.normByte(rgba[0]);
			this.g=PixelColor.normByte(rgba[1]);
			this.b=PixelColor.normByte(rgba[2]);
			this.a=PixelColor.normByte(rgba[3]!==undefined?rgba[3]:255);
		};
	}

	mix(rgba){
		let rgba0 = this.toArray();
		let coeff=rgba[3]/255;//transparancy
		for(let i=0; i<3; i++)
			rgba0[i] += (rgba[i]-rgba0[i])*coeff;//Angle.grow()
		rgba0[3]=Math.max(rgba0[3], rgba[3]);
		this.fromArray(rgba0);
	}

	static calcAverage(rgba){//[0..255]
		return (rgba[0]+rgba[1]+rgba[2])/3;
	}

	static calcBrightness(rgba){//[0..255]
		return PixelColor.calcAverage(rgba);
	}

	static calcContrast(rgba){//[0..255]
		return (
		Math.abs(rgba[0]-rgba[1])+
		Math.abs(rgba[1]-rgba[2])+
		Math.abs(rgba[2]-rgba[0])) /2;
	}

	static calcHue(rgba){//[0..1529]
		function calc(shift,left,center,right)
		{
			if (center==left ) return (shift+0)*255;
			if (left  ==right) return (shift+1)*255;
			if (center==right) return (shift+2)*255;

			if (left>right) return (shift+1)*255 +   Math.round((right-left)/(center-right)*255);
			if (right>left) return (shift+1)*255 +   Math.round((right-left)/(center-left)*255);
		};
		let r=rgba[0], g=rgba[1], b=rgba[2];
		let hue;

		if((r<=g)&&(g>=b)) hue=calc(1,r,g,b); //r<=g g>=b
		if((g<=b)&&(b>=r)) hue=calc(3,g,b,r); //g<=b b>=r
		if((b<=r)&&(r>=g)) hue=calc(5,b,r,g); //b<=r r>=g

		return hue % 1530;
	}

	static calcHSL(rgba){
		//https://www.rapidtables.com/convert/color/rgb-to-hsl.html
		let r = rgba[0]/255;
		let g = rgba[1]/255;
		let b = rgba[2]/255;
		let minC = Math.min(r,g,b);
		let maxC = Math.max(r,g,b);
		let dltC = maxC-minC;
		let brightness = (maxC+minC)/2;
		let contrast = 0;
		if(brightness>0 && brightness<1)
			contrast = dltC/(1-Math.abs(2*brightness-1));
		let hue = 0;
		if(dltC){
			if(Math.abs(maxC-r)<0.001)
				hue = (((g-b)/dltC)%6)*(Math.PI/3);
			if(Math.abs(maxC-g)<0.001)
				hue = (((b-r)/dltC)+2)*(Math.PI/3);
			if(Math.abs(maxC-b)<0.001)
				hue = (((r-g)/dltC)+4)*(Math.PI/3);
			if(hue<0)
				hue+=Math.PI*2;
		};
		return {brightness, contrast, hue};
	}

	static calcRGB(brightness,contrast,hue){
		//https://www.rapidtables.com/convert/color/hsl-to-rgb.html
		let c = (1-Math.abs(2*brightness-1))*contrast;
		let x = c*(1-Math.abs( (hue/(Math.PI/3))%2 -1 ));
		let m = brightness - c/2;

		let sector = Math.floor(hue/(Math.PI/3));//0..5
		let r1=0, g1=0, b1=0;
		switch (sector) {
			case 0: r1=c; g1=x; break;
			case 1: r1=x; g1=c; break;
			case 2: g1=c; b1=x; break;
			case 3: g1=x; b1=c; break;
			case 4: r1=x; b1=c; break;
			case 5: r1=c; b1=x; break;
			default: break;
		}
		let r = Math.min(255,Math.round((r1+m)*255));
		let g = Math.min(255,Math.round((g1+m)*255));
		let b = Math.min(255,Math.round((b1+m)*255));
		let rgba =[r,g,b,255];
		return rgba;
	}

	getBrightness(){//Яркость [0..1] снизу вверх
		return PixelColor.calcBrightness(this.toArray())/255;
	}

	getContrast(){//Контраст [0..1] от центральной оси к поверхности шара 
		return PixelColor.calcContrast(this.toArray())/255;
	}

	getHue(){//Оттенок [0..2*PI] по кругу все цвета радуги
		return PixelColor.calcHue(this.toArray())/1529*2*Math.PI;
	}

	getColorCoords(){
		let hsl = PixelColor.calcHSL(this.toArray());
		let radius = hsl.contrast;
		return {
			x:Math.sin(hsl.hue)*radius,
			y:Math.cos(hsl.hue)*radius,
			z:hsl.brightness*2-1
		};
		//x:[-1..1], y:[-1..1], z:[-1..1]
	}

}
