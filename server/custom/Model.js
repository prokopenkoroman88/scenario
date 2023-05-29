const Table = require('./../core/Table');

class Model{

	static tableName(){ return ''};//string name of table

	static table;//object of Table

	static newTable(tableName=''){
		if(!tableName)
			tableName=this.tableName();
		return new Table(tableName);
	}


	static tableCaption(){ return 'Заголовок таблиці'};

	static selectColumns(){ return '*' };

	static objectAttrs(){ return [] };

	static attr(name, caption, type='text', tableName='', classList=''){
		//for type=='select' name must be without '..._id'
		return {name, caption, type, tableName, classList}
	}


	static select(fields='*', where='', group='', order=''){
		return this.table.select(fields,where,group,order);
	}

	static all(){
		const columns = this.selectColumns();
		return this.table.select(columns);
	}

	static init(){
		return {};//defValues
	}

	static add(obj){
		const result = this.table.insert(obj);
		return result;
	}

	static byId(id){
		const columns = this.selectColumns();
		const result = this.table.select(columns, `id=${id}`);
		let obj=result;
		return obj;
	}

	static byField(fieldName, fieldValue){
		const columns = this.selectColumns();
		const result = this.table.select(columns, `${fieldName} = ${fieldValue}`);
		return result;
	}

	static byWhere(where){
		const columns = this.selectColumns();
		const result = this.table.select(columns, where);
		return result;
	}

	static edit(id, obj, where=''){
		const result = this.table.update(id, obj, where);
		return result;
	}

	static del(id=-1, where=''){
		const result = this.table.delete(id, where);
		return result;
	}


//============================

	constructor(data){
		if(typeof data =='object'){
			this.id=data.id;
			this.obj=data;
		}
		else if (typeof data =='number') {
			this.id=data;
			this.obj=Model.find(id);
		}
	}

	isNew(){
		return this.id>0;
	}

	save(){
		if(this.isNew())
			this.edit(this.id, this.obj);
		else
			this.add(this.obj);
	}

}

module.exports = Model;
