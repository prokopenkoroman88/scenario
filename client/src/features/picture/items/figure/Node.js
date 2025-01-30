import CustomPoint from './../custom/CustomPoint.js';

export default class Node extends CustomPoint {

	get array(){ return 'nodes'; }

	get branches(){
		//find branches of node:
		return this.getOwners('branches');
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
