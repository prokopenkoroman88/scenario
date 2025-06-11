import PixelColor from './PixelColor.js';


function between(a,b, coeff=0.5){
	return a+(b-a)*coeff;
}

export default class ColorCoords{

	static between(coords1,coords2, coeff=0.5){
		let coords = new ColorCoords();
		coords.brightness = between(coords1.brightness, coords2.brightness, coeff);
		coords.contrast = between(coords1.contrast, coords2.contrast, coeff);
		coords.hue = between(coords1.hue, coords2.hue, coeff);
		coords.coords.x = between(coords1.x, coords2.x, coeff);
		coords.coords.y = between(coords1.y, coords2.y, coeff);
		coords.coords.z = between(coords1.z, coords2.z, coeff);
		return coords;
	}

	constructor(color=null){
		if(color)
			this.init(color);
	}

	init(color){
		let pixel;//PixelColor
		let type = typeof color;
		if((type == 'object') && (color.constructor.name=='PixelColor'))
			pixel=color;
		else
			pixel=new PixelColor(color);

	try {
		let hsl = PixelColor.calcHSL(pixel.toArray());
		this.brightness=hsl.brightness;//Широта, яскравість 0 .. 1 //lat
		this.contrast=hsl.contrast;//Радіус, контраст 0 .. +1 //rad
		this.hue=hsl.hue;//Довгота, відтінок 0 .. 2*PI //long
		this.coords=pixel.getColorCoords();//x:[-1..1], y:[-1..1], z:[-1..1]
	} catch(e) {
		console.log(e);
		console.log(type);
	};

	}

	get L(){ return this.brightness}

	get S(){ return this.contrast}

	get H(){ return this.hue}

//	get lat(){ return (this.brightness*2-1)*Math.PI/2; }//-PI/2 .. +PI/2
	get lat(){ return Math.asin(this.brightness*2-1); }//-PI/2 .. +PI/2

	get rad(){ return this.contrast; }//0 .. 1

	get long(){ return this.hue; }//0 .. 2*PI

	set x(value){ this.coords.x=value }
	get x(){ return this.coords.x }

	set y(value){ this.coords.y=value }
	get y(){ return this.coords.y }

	set z(value){ this.coords.z=value }
	get z(){ return this.coords.z }

}
