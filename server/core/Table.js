const db = require("./db");//pool


class Table{
	constructor(tableName){
		this.db = db;//pool
		this.tableName = tableName;
	}

	async execute(query, params=[]){
		const result = await this.db.query(query, params);
		return result;
	}


//prepare methods:

	getAttrs(obj){
		return Object.getOwnPropertyNames(obj);
	}

	attrsToFields(attrs){
		let fields='';
		attrs.forEach((fieldName, idx)=>{
			fields+=(idx?', ':'')+'`'+fieldName+'`';
		});
		return fields;
	}

	attrsToValues(attrs, obj){
		let values='';
		attrs.forEach((fieldName, idx)=>{
			values+=(idx?', ':'')+this.prepareValue(obj, fieldName);
		}, this);
		return values;
	}

	attrsToSets(attrs, obj){
		let sets='';
		attrs.forEach((fieldName, idx)=>{
			sets+='\n '+(idx?',':' ')+fieldName+' = '+this.prepareValue(obj, fieldName);
		}, this);
		return sets;
	}

	prepareValue(obj, fieldName){
		let value = obj[fieldName];
		if((typeof value =='string'))// && value.match(/[А-ЯІЄЇҐ]/img))
			value="'"+value+"'";
		return value;
	}


//common methods:

	query(query, params=[]){
		return this.execute(query, params);
	}

	select(fields='*', where='', group='', order=''){
		let query = `SELECT ${fields} \nFROM ${this.tableName}`;
		if(where)
			query+='\nWHERE '+where;
		if(group)
			query+='\nGROUP BY '+group
		if(order)
			query+='\nORDER BY '+order;
		return this.query(query);
	}

	insertArray(arr=[]){
		if(!arr.length)
			return;
		let obj0=arr[0];
		let attrs = this.getAttrs(obj0);
		let fields=this.attrsToFields(attrs);
		let query = `INSERT INTO ${this.tableName} (${fields})`;
		query+='\nVALUES';
		arr.forEach( (obj, index)=>{
			let values=this.attrsToValues(attrs, obj);
			query+='\n '+(index?',':' ')+'('+values+')';										
		}, this);
		return this.query(query);	
	}

	insertObj(obj={}){
		let attrs = this.getAttrs(obj);
		let fields=this.attrsToFields(attrs);
		let query = `INSERT INTO ${this.tableName} (${fields})`;
		let values=this.attrsToValues(attrs, obj);
		query+='\nVALUES ('+values+')';
		return this.query(query);		
	}

	insert(data){
		if(Array.isArray(data))
			return this.insertArray(data)
		else
			return this.insertObj(data)
	}

	update(id=0, obj={}, where=''){
		let attrs = this.getAttrs(obj);
		let sets = this.attrsToSets(attrs, obj);
		let query = `UPDATE ${this.tableName} SET ${sets}`;
		if(id>0)
			where=' id='+id;
		if(where)
			query+='\nWHERE '+where;
		return this.query(query);	
	}

	delete(id=0, where=''){
		let query = `DELETE FROM ${this.tableName}`;
		if(id>0)
			where=' id='+id;
		if(where)
			query+='\nWHERE '+where;
		return this.query(query);
	}

}

module.exports = Table;
