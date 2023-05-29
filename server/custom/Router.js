const app = require("./../core/app");

class Router{
	constructor(controllerName=''){
		this.app = app;
		this.controller = this.findController(controllerName);
	}

	findController(controllerName=''){
		let Controller=null, controller=null;
		if(controllerName)
			Controller = require('./../controllers/'+controllerName);//imports class
		if(!Controller)
			Controller = require('./../custom/Controller');
		controller = new Controller();
		return controller;
	}

	route(method, url, controllerMethod){
		//controllerMethod = async (req, res) => { }
		this.app[method](url, controllerMethod);//(req, res)
	}

	controllerRoute(method, url, controller_method){
		let controllerName = controller_method.split('.',2)[0];
		let methodName = controller_method.split('.',2)[1];

		let controller = this.controller;
		if(controllerName)
			controller = this.findController(controllerName);

		console.log('Add route:', method,url,controllerName,methodName);
		//this.app[method](url, async (req, res) => {
		this.route(method, url, async (req, res) => {
			console.log('\nLISTEN:',method,url,controllerName,methodName);

			try{
				let params = this.prepareParams(controllerName, methodName, req);
				const result = await controller[methodName](...params);//controller -> model -> query
				this.sendResult(methodName, result, res);
			} catch(err) {
				console.error(err.message)
			}

		});
	}

	sendResult(methodName, result, res){//for overriding
	}

	controllerRoutes(controllerName=''){//for overriding
		//this.controllerRoute('get', url, 'Controller.method');
	}

}

module.exports = Router;
