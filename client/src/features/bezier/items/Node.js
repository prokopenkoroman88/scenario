import CustomPoint from './CustomPoint.js';

export default class Node extends CustomPoint {

	get array(){ return 'nodes'; }

	constructor(ownerFigure,x,y){
		super(ownerFigure,x,y);
	}

	get branches(){
		//find branches of node:
		let node_branches=[];
		let node=this;
		this.ownFigure.branches.forEach( (branch)=>{
			if(branch.nodes.indexOf(node)>=0)
				node_branches.push(branch);
		});
		return node_branches;
	}

	shift(dx,dy,bCascade=!true){
		if(bCascade){
			this.branches.forEach(branch=>branch.shift(dx,dy, this));
			this.ownFigure.splines.forEach(spline=>spline.prepare());
		};
		super.shift(dx,dy);
		this.ownFigure.branches.forEach(branch=>branch.prepare());
	}

};
