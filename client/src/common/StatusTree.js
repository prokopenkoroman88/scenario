export default class StatusTree {

	constructor(){
		this.tree={};
	}

	parsePath(path){
		return path.split('.');
	}

	setStatus(statusPath, value=true){
		let links = this.parsePath(statusPath);
		let status = this.tree;
		for(let i=0; i<links.length; i++){
			if(i<links.length-1){
				if(!status[links[i]])
					status[links[i]]={};
				status=status[links[i]];
			}
			else{//last
				if(status)
					status[links[i]]=value;
			};
		};
	}

	resetStatus(statusPath=''){
		let links = this.parsePath(statusPath);
		if(!links.length){
			this.tree={};//clear
			return;
		};
		let status = this.tree;
		for(let i=0; i<links.length; i++){
			if(i<links.length-1){
				status=status[links[i]];
				if(!status){
					return//ok
				};
			}
			else{//last
				if(status)
					delete status[links[i]];
			};
		};
	}

	getStatus(statusPath){
		let links = this.parsePath(statusPath);
		let status = this.tree;
		for(let i=0; i<links.length; i++){
			status=status[links[i]];
			if(!status)
				break;
		};
		if(typeof status == 'object')
			return status!=undefined;
		else
			return status;
	}

}
