class View{
	constructor(modelName=''){
		this.Model=this.findModelClass(modelName);
		this.caption=this.Model?this.Model.tableCaption():'';
		this.attrs=[];
		this.columns=[];
		this.fields=[];
		this.init();
		this.fill();
	}

	findModelClass(modelName=''){
		let Model=null;
		if(modelName)
			Model = require('./../models/'+modelName);//imports class
		return Model;
	}

	field(name, caption, type='text', tableName='', classList=''){
		return {name, caption, type, tableName, classList}
	}

	column(name, caption){
		return {name, caption};
	}

	initByModel(){
		this.attrs=this.Model?this.Model.objectAttrs():[];
	}

	init(){//for overriding
		this.initByModel();
	}

	fillColumns(){//for overriding
		this.attrs.forEach((attr)=>{
			this.columns.push({
				name:attr.name,
				caption:attr.caption,
			});
		}, this);
	}

	fillFields(){//for overriding
		this.attrs.forEach((attr)=>{
			this.fields.push({
				type:attr.type,
				name:attr.name+(attr.type=='select'?'_id':''),
				caption:attr.caption,
				tableName:attr.tableName,
				classList:attr.classList,
			});
		}, this);
	}

	fill(){
		this.fillColumns();
		this.fillFields();
	}
}

module.exports = View;
