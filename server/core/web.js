const CustomRouter = require('./../custom/Router');
const CustomResourceRouter = require('./../custom/ResourceRouter');


class RouterManager{
	constructor(){
		this.init();
	}

	add(routerName='', controllerName='', modelName='', tableName='', res=true){
		console.log('INIT(', routerName, controllerName, modelName, tableName,')');
		let Router, router;

		if(routerName){
			let path = './../routers';
			//if(res)
			//	path+='/resources';
			Router = require(path+'/'+routerName);
			router = new Router();//params are not needed
		}
		else{
			if(res){
				Router = CustomResourceRouter;
				router = new Router(controllerName, modelName, tableName);
			}
			else{
				Router = CustomRouter;
				router = new Router(controllerName);
			}
		};

		router.controllerRoutes();//adds bindings between URLs and controller methods
		return router;
	}

	init(){
	}

}

const web = new RouterManager();

module.exports = web;
