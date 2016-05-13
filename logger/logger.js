var ENV = require('../env');
var bunyan = require('bunyan');
var bunyanRequest = require('express-bunyan-logger');

var logger = bunyan.createLogger({
	name: ENV.APP_NAME,
	serializers: bunyan.stdSerializers
});

// Enable debug-level logging while in development
if(ENV.NODE_ENV === 'development'){
	logger.level(bunyan.DEBUG);
}

// helper to simlpify debugging statements throught the app.
var debug = (obj) => logger.debug({debug:obj});

// A middleware that will log requests
var requestLogger = bunyanRequest({
	logger: logger
});
// An errorHandler middleware that will log errors
var errorLogger = bunyanRequest.errorLogger({
	logger: logger
});

module.exports = exports = {
	logger,
	requestLogger,
	errorLogger,
	debug
};
