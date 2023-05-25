const mysql = require('mysql');
const usePool = true;

const db = {

	connection : null,

	create : function(){

		try {

			if(usePool)
				this.pool=mysql.createPool({
					//https://github.com/mysqljs/mysql#pooling-connections
					connectionLimit : 10,
					host     : process.env.DB_HOST,
					user     : process.env.DB_USERNAME,
					password : process.env.DB_PASSWORD,
					database : process.env.DB_DATABASE,
	//				port     : process.env.DB_PORT,
				});
			else
				this.connection=mysql.createConnection({
					host     : process.env.DB_HOST,
					user     : process.env.DB_USERNAME,
					password : process.env.DB_PASSWORD,
					database : process.env.DB_DATABASE,
	//				port     : process.env.DB_PORT,
				});

		} catch(error) {
			console.log(' --- creation error: ---');
			console.log(error);
		}

	},

	connect : function(){
		if(usePool){
			this.connection = this.pool;
			return;
		};

		new Promise((resolve, reject) => {
			try {
				this.connection.connect();
				resolve();
			} catch(error) {
				console.log(' --- connection error: ---');
				console.log(error);
				reject(error);
			}
		});

	},

	query : async function(text){
		console.log('\n --- Query: ---');
		console.log(text);
		let result={};
		let d= new Date;
		let t1=d.getTime();

		await new Promise((resolve, reject) => {
			try{
				// Resolve the promise when the query is done
				this.connection.query(text,  (error, results, fields) => {  //, []?,
					if (error) throw error;
					resolve();
					result.rows=results;

				});
			}catch(error){
				console.log(' --- error: ---');
				console.log(error);
				reject(error);
			}
		});

		let t2=d.getTime();
		console.log(' --- executed in '+(t2-t1)+' ms ---\n');
		return result;
	},

	disconnect : function(){
		this.connection.end();
	},

};

db.create();
db.connect()

module.exports = db;
