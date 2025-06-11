import CustomRect from './../../../../custom/CustomRect.js'

export default class Rect extends CustomRect{

	correct(point){
		if(this.left>point.x)
			this.left=point.x;
		if(this.right<point.x)
			this.right=point.x;
		if(this.top>point.y)
			this.top=point.y;
		if(this.bottom<point.y)
			this.bottom=point.y;
	}

	prepare(points){
		this.reset();
		points.forEach(point=>this.correct(point));
	}

	inRect(x,y,CURSOR_RADIUS=0){
		return (x>=this.left-CURSOR_RADIUS
			&& x<=this.right+CURSOR_RADIUS
			&& y>=this.top-CURSOR_RADIUS
			&& y<=this.bottom+CURSOR_RADIUS
		);
	}

};
