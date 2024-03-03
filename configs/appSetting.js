const mongoose = require('mongoose');

const db = require("../models");
const USERMODEL = db.user;
const COUNTERMODEL = db.counter;

const { defaultUser } = require("./index");

module.exports = {
	connectDatabase:async () => {
		try {
			const options = {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			};
			const connection = await mongoose.connect(process.env.DB_URI, options);
			mongoose.Promise = global.Promise;
			if(connection) console.log('Database Connected Successfully...');
			//CREATE DEFAULT USERS
			createDefaultAdmin();
		} catch (err) {
			console.log('Error while connecting database\n');
			console.log(err);
			// Exit process with failure
			process.exit(1);
		}
	},
	printRequestLogger:async (req,res,next) => {
		const _query = req.query;
		const _params = req.params;
		const _body = JSON.parse(JSON.stringify(req.body));
		const _files = req.files;

		console.log('\x1b[36m%s\x1b[0m','\n##############################################');
		console.log('METHOD       :', req.method);
		console.log('HEADER       :', req.headers['user-agent']);
		console.log('URL          :', req.originalUrl);
		console.log('DATE TIME    :', new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}));
		if(!isEmptyObject(_query)) {
			console.log('\nQUERY  : ');
			console.log(_query);
		}
		if(!isEmptyObject(_params)) {
			console.log('\nPARAMS : ');
			console.log(_params);
		}

		if(!isEmptyObject(_body)) {
			console.log('\nBODY   : ');
			console.log(_body);
		}

		if(_files && _files.length > 0) {
			console.log('\nFILES  : ');
			console.log(_files);
		}
		console.log('\x1b[36m%s\x1b[0m','\n##############################################');
		next();
	}
};

function isEmptyObject(value) {
	return Object.keys(value).length === 0 && value.constructor === Object;
}

async function createDefaultAdmin(){
	// ################# CREATE ADMIN ############################ //
	for (const iterator of defaultUser) {
		try {
			const userData = await USERMODEL.findOne({ "email": iterator.email, "role": iterator.role }).select("email").lean();
			if (!userData) {
				await USERMODEL.create(iterator);
				console.log("\x1b[31m%s\x1b[0m", "##################################");
				console.log("\x1b[33m%s\x1b[0m", "SUCCESSFULLY CREATE ADMIN");
				console.log("\x1b[33m%s\x1b[0m", `USER : ${iterator.email}\nPASS : ${iterator.password}`);
				console.log("\x1b[31m%s\x1b[0m", "##################################");
			}
		} catch (e) {
			console.log("FAIL :: ON CREATED ADMIN USER ::> ",e);
		}
	}
	// ################# SET COUNTER VALUE ############################ //
	try {
		const isExist = await COUNTERMODEL.findOne({ "uniqueName": "PROGRESS_COUNTER"}).select("uniqueName").lean();
		if(!isExist){
			COUNTERMODEL.create({ "uniqueName": "PROGRESS_COUNTER"});
			console.log("\x1b[31m%s\x1b[0m", "##################################");
			console.log("\x1b[33m%s\x1b[0m", `COUNTER CONFIG VALUE SET.`);
			console.log("\x1b[33m%s\x1b[0m", `Name: PROGRESS_COUNTER\nValue: 1000`);
			console.log("\x1b[31m%s\x1b[0m", "##################################");
		}
	} catch (e) {
		console.log("FAIL :: ON COUNTER CONFIG VALUE SET ::> ",e);
	}
  }