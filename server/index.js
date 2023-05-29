require('dotenv').config();

const app = require("./core/app");
const db = require("./core/db");//pool
const web = require("./core/web");//routerManager

process.on('uncaughtException', function (error) {
	console.log(' --- Uncaught exception: ---');
	console.log(error);
});

const app_port = process.env.APP_PORT;

app.listen(app_port, () => {
	console.log('Server has started on port '+app_port);
});
