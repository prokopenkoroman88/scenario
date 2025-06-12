import CustomView from './CustomView.jsx';
import PixelColor from './../../canvas/PixelColor.js';


export default class ExtremumView extends CustomView{

	init(){
		this.colors={
			min:[0,255,0,255],
			max:[0,0,255,255],
		};
	}

	getColor(kind){
		switch(kind){
		case 'max':
			return this.colors.max;
		case 'min':
			return this.colors.min;
		};
	}

	paintLines(area, stepH=3){
		const rect=area.block.rect;
		const type=area.block.type;

		//values:
		area.lists.forEach((list,index)=>{
			let point0, point1;
			let rgba=[255,0+index*5,0,255];//from red to yellow
			list.values.forEach((value, i)=>{
				point1={
					x:rect.left+i,
					y:rect.bottom-value+index*stepH,
				};
				if(type=='H' && i>0){
					//values are cyclic for Hue
					if((point1.y-point0.y)>128)
						point1.y-=255;
					else
						if((point1.y-point0.y)<-128)
							point1.y+=255;
				};
				if(i>0)
					this.canvas.line(point0, point1, rgba);
				point0={...point1};
			});
		});

		//items: max, min
		area.lists.forEach((list,index)=>{
			let point0, point1;
			list.items.forEach((item, i)=>{
				point1={
					x:item.coords.x,
					y:rect.bottom-item.value+index*stepH,
				};
				if(type=='H' && i>0){
					//values are cyclic for Hue
					if((point1.y-point0.y)>128)
						point1.y-=255;
					else
						if((point1.y-point0.y)<-128)
							point1.y+=255;
				};
				let rgba=this.getColor(item.kind);
				this.canvas.setRGB(point1.x, point1.y, rgba);
				point0={...point1};
			});
		});
	}


	paintArea(area){
		area.lists.forEach((list,index)=>{
			list.items.forEach((item, i)=>{
				let point={...item.coords};
				let rgba=this.getColor(item.kind);
				this.canvas.setRGB(point.x, point.y, rgba);
			});
		});
	}

	paint(params){
		let block, look, area;

		if(params.L){
			block=this.model.extrL;
			params.L.looks.forEach(look=>{
				area = block.areas[look];
				this.paintArea(area);
			});
		};

		if(params.S){
			block=this.model.extrS;
			params.S.looks.forEach(look=>{
				area = block.areas[look];
				this.paintArea(area);
			});
		};

		if(params.H){
			block=this.model.extrH;
			params.H.looks.forEach(look=>{
				area = block.areas[look];
				this.paintArea(area);
			});
		};

	}

}
