import axios from 'axios';

// https://github.com/axios/axios/issues/2825
// Щоби запит на виконувався двічі, прибрав <React.StrictMode> из index.js
// або можна додати event.preventDefault(); в обробник
const REACT_APP_API_URL='http://localhost:3306';

class Loader{
	constructor(){
		this.host = axios.create({
			//https://axios-http.com/docs/req_config
			baseURL: process.env.REACT_APP_API_URL || REACT_APP_API_URL,
		});
	}

	showResult(response){
		//console.log('showResult');
		if(response.status === 200){//statusText:"OK"
			//console.log(response);
			//console.log(response.data);
			return response.data;
		}
		else
			console.log(response);
	}

	showError(error){
		console.log(error.message);
	}

	async request(method, url, obj={}, showResult=null){
		if(!showResult)
			showResult = this.showResult;
		let res;
//		console.log('request', method, url);
		await this.host[method](url, obj).then(async (response) =>{
			res = await showResult(response);
		},this.showError);
		return res;
	}

}


class ResourceLoader extends Loader{
	constructor(tableName, caption=''){
		super();
		this.tableName = tableName;
		this.caption = caption;
	}

	url(pref='', id=0, where=''){
		let res=`/${this.tableName}`;
		if(pref)
			res+=`/${pref}`;
		if(id>0)
			res+=`/${id}`;
		if(where)
			res+=`/where/${where}`;
		return res;
	}


	//schemes from View:

	async scheme(pref, func){
		let res = await this.request('get', this.url(pref), {});
		if(func)
			func(res);
		return res;
	}

	async listScheme(func){
		return await this.scheme('scheme/list', func);
	}

	async treeScheme(func){
		return await this.scheme('scheme/tree', func);
	}

	async formScheme(func){
		return await this.scheme('scheme/form', func);
	}


	//work with table data:

	async getAll(func){
		let res = await this.request('get', this.url(), {});
		if(func)
			func(res.rows);
		return res.rows;
	}

	async init(func){
		let res = await this.request('get', this.url('create'), {});//create
		if(func)
			func(res);
		return res;
	}

	async byId(id, func){
		let res = await this.request('get', this.url('edit',id), {});//edit
		if(func)
			func(res.rows[0]);
		return res;
	}

	async byField(fieldName, fieldValue, func){
		if(typeof fieldValue == 'string')
			fieldValue=`'${fieldValue}'`;
		let res = await this.request('get', this.url('',0,fieldName+'='+fieldValue), {});
		if(func)
			func(res.rows);
		return res;
	}

	async byWhere(where, func){
		let res = await this.request('get', this.url('',0,where), {});
		if(func)
			func(res.rows);
		return res;
	}

	async add(obj, func){//can obj and array
		let res = await this.request('post', this.url(), obj);//insert
		if(func)
			func(res);
		return res;
	}

	async edit(id, obj, func){
		let res = await this.request('put', this.url('',id), obj);//update
		if(func)
			func(res);
		return res;
	}

	async del(id, func){
		let res = await this.request('delete', this.url('',id), {});//delete
		if(func)
			func(res);
		return res;
	}

	async delWhere(where='', func){
		let res = await this.request('delete', this.url('',0,where), {});//delete
		if(func)
			func(res);
		return res;
	}

}

export { Loader, ResourceLoader }
