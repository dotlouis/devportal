var ENV = require('../env');
var log = require('../logger/logger').logger;

// must use as last errorHandler
function shutdownOnError(err, req, res, next){
	// shutdown server gracefully if 500;
	if(!err.code || err.code >= 500){
		req.log.fatal('SHUTTING DOWN PROCESS...in 5 seconds');
		setTimeout(()=>process.exit(),5000);
	}

	// doesn't call next() to bypass express default errorHandler
}

function errorHandler(err, req, res, next){
	let responseError,
		error;

	if(err instanceof Error){
		error = err;
		// if the error thrown have a suggested status code, use it.
		error.code = err.status || err.code || err.statusCode || 500;
	}
	else{
		req.log.fatal('Unexpected thrown object. See said object below for details');
		error = new Error(err);
		error.code = 500;
	}

	// the response object that will be sent to the client
	responseError = createReponseError(error);

	// send the error response
	res.locals.error = responseError;
	res.status(responseError.status).render('error');

	if(error.code < 500){
		next();
	}
	else{
		next(error);
	}
}


function createReponseError(error){
	let payload = {};
	payload.status = error.code;
	payload.message = error.name + (error.message ? (': '+error.message) : '');

	// include the stack in development
	if(ENV.NODE_ENV === 'development'){
		payload.stack = error.stack;
	}

	return payload;
}

module.exports = exports = {
	shutdownOnError,
	errorHandler
};
