const Router = require('./Router');

class ResourceRouter extends Router{
	constructor(controllerName='', modelName='', tableName=''){
		super();
		this.controller = this.findResourceController(controllerName, modelName, tableName);
		this.tableName = tableName?tableName:this.controller.tableName;
	}

	findResourceController(controllerName='', modelName='', tableName=''){
		let Controller, controller;
		if(controllerName){
			Controller = require('./../controllers/'+controllerName);//imports class
			if(Controller)
				controller = new Controller();//params are not needed
		};
		if(!Controller){
			Controller = require('./../custom/ResourceController');
			controller = new Controller(modelName, tableName);
		};
		return controller;
	}

	prepareParams(controllerName, methodName, req){
		const { id } = req.params;
		const obj = req.body;
		//?const files = req.files;
		let params = [id,obj];
		if(methodName=='store')
			params.shift();
		return params
	}

	sendResult(methodName, result, res){
		super.sendResult(methodName, result, res);
		console.log(JSON.stringify(result.rows));//index
		let row;
		if(result && result.rows)
			row=result.rows[0];
		switch (methodName) {//command
			case 'index'  : res.json(result   ); break;//result.rows
			case 'show'   : res.json(row); break;
			case 'create' : res.json(result); break;// return result;
			case 'store'  : res.json(result); break;//after create row
			case 'edit'   : res.json(result); break;// return result;
			case 'update' : res.json(row); break;//after edit
			case 'destroy': res.json('Record #'+id+' was deleted from "'+this.table+'"'); break;
			default: res.json(result); break;
		};
	}

	schemeRoutes(controllerName){
		let url='/'+this.tableName+'/scheme';
		this.controllerRoute('get',url+'/list',controllerName+'.listScheme');
		this.controllerRoute('get',url+'/tree',controllerName+'.treeScheme');
		this.controllerRoute('get',url+'/form',controllerName+'.formScheme');
	}

	resourceRoutes(controllerName=''){
		let url='/'+this.tableName;
		let sId='/:id';
		this.controllerRoute('get'   ,url            ,controllerName+'.index');
		this.controllerRoute('get'   ,url+'/create'  ,controllerName+'.create');//?
		this.controllerRoute('post'  ,url            ,controllerName+'.store');
		this.controllerRoute('get'   ,url+sId        ,controllerName+'.show');
		this.controllerRoute('get'   ,url+'/edit'+sId,controllerName+'.edit');//?
		this.controllerRoute('put'   ,url+sId        ,controllerName+'.update');
		this.controllerRoute('delete',url+sId        ,controllerName+'.destroy');
	}

	controllerRoutes(controllerName=''){
		super.controllerRoutes(controllerName);
		this.schemeRoutes(controllerName);
		this.resourceRoutes(controllerName);
	}

}

module.exports = ResourceRouter;
