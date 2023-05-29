//const Controller = require('./Controller');

class ResourceController{//? extends Controller{
	constructor(modelName='', tableName=''){
		this.Model = this.findModelClass(modelName, tableName);
		this.view = this.findView(modelName);
		this.tableName = tableName?tableName:this.Model.tableName;
	}

	findModelClass(modelName='', tableName=''){
		let Model=null;
		if(modelName)
			Model = require('./../models/'+modelName);//imports class
		if(!Model){
			let CustomModel=require('./../custom/Model');
			Model = [CustomModel].map((c)=>{return c})[0];//clone
			//Model = JSON.parce(JSON.stringify(CustomModel));//clone
			Model.tableName=()=>tableName;
			Model.table=Model.newTable();
		};
		return Model;
	}

	findView(modelName=''){
		let View=null, view=null;
		if(modelName){
			//find View by model's name + 'View'
			try {
				View = require('./../views/'+modelName+'View');//imports class
			} catch(error) {
				//console.log('not found '+'./../views/'+modelName+'View');
				if(error.code!='MODULE_NOT_FOUND')//Cannot find module
					throw error;
			};
			if(View)
				view = new View();
		};
		if(!view){
			View = require('./../custom/View');
			view = new View(modelName);
		};
		return view;
	}


	listScheme(){
		return {
			caption:this.view.caption,
			columns:this.view.columns,	
		}
	}

	treeScheme(){
		return {
			caption:this.view.caption,
			columns:this.view.columns,	
		}
	}

	formScheme(){
		return {
			caption:this.view.caption,
			fields:this.view.fields,
		}
	}


	index(){
		const result = this.Model.all();
		return result;
	}

	create(){
		const result = this.Model.init();
		return result;
	}

	store(obj){
		const result = this.Model.add(obj);
		return result;
	}

	show(id){
		const result = this.Model.byId(id);
		return result;
	}

	edit(id){
		const result = this.Model.byId(id);
		return result;
	}

	update(id, obj){
		const result = this.Model.edit(id,obj);
		return result;
	}

	destroy(id){
		const result = this.Model.del(id);
		return result;
	}

}

module.exports = ResourceController;
