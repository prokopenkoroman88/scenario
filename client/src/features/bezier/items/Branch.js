import Angle from './../../../common/Angle.js';
import Rect from './Rect.js';
import FigureItem from './FigureItem.js';

export default class Branch extends FigureItem{

	get array(){ return 'branches'; }

	constructor(ownerFigure, nodes, points){
		super(ownerFigure);
		this.nodes=nodes;//[0,1]
		this.points=points;
		this.prepare();
	}

	get nodeIds(){
		let ids = this.nodes.map((node)=>{
			return this.ownFigure.nodes.indexOf(node);
		},this);
		return ids;
	}

	get pointIds(){
		let ids = this.points.map((point)=>{
			return this.ownFigure.points.indexOf(point);
		},this);
		return ids;
	}

	prepareRect(){
		this.rect.prepare(this.nodes);
	}

	prepare(){
		if(!this.rect)
			this.rect = new Rect();
		this.prepareRect();
	}

	shift(dx,dy, node){
		//Пересування node спричиняє пересування пов'язаних з цим branch точок
		let old_node0 = this.nodes[0];
		let old_node1 = this.nodes[1];

		let old_dist = Angle.dist2D(old_node0, old_node1);
		let old_angle = Angle.angle(old_node0, old_node1);

		let iNode = this.nodes.indexOf(node);
		if(iNode<0)
			return;

		let new_node0 = old_node0;
		if(iNode==0)
			new_node0 = Angle.newDot(old_node0,{dx,dy});//копія, щоби не перемістити nodes[0] завчасно

		let new_node1 = old_node1;
		if(iNode==1)
			new_node1 = Angle.newDot(old_node1,{dx,dy});

		let new_dist = Angle.dist2D(new_node0, new_node1);
		let new_angle = Angle.angle(new_node0, new_node1);

		this.points.forEach(point=>{
			let coords=this.calcCoords(point);
			let coordsH={
				angle : new_angle,
				dist : coords.height * (new_dist/old_dist),
			};
			let coordsW={
				angle : new_angle+Math.PI/2,
				dist : coords.width,
			};
			//переміщення points здійснюється від nodes[0]
			let pointH=Angle.newDot(new_node0, coordsH);
			Angle.moveRadial(pointH, point, coordsW);
		});
	}

	calcCoords(point){
		let radBranch = Angle.calcRadial(this.nodes[0], this.nodes[1]);
		let radPoint = Angle.calcRadial(this.nodes[0], point);
		let cmpAngle = Angle.diff(radBranch.angle, radPoint.angle);
		return {
			radBranch,//абсолютні радіальні координати branch
			radPoint,//абсолютні радіальні координати point
			cmpAngle,//кут point відносно branch
			height: Math.cos(cmpAngle) * radPoint.dist,
			width: Math.sin(cmpAngle) * radPoint.dist,
		};
	}

	distance(x,y){
		//відстань точки p до Branch, висота трикутника, для isNear
		const coords = this.calcCoords({x,y});
		return Math.abs(coords.width);
	}

	isNear(x,y,CURSOR_RADIUS=0){
		if(!this.rect.inRect(x,y))
			return false;
		return this.distance(x,y)<CURSOR_RADIUS;
	}

};
