var pkg = require('./package.json');
var uuid = require('uuid');


var ENV = {};

ENV.SUPPORT_EMAIL = 'support@soon.com';

ENV.NODE_ENV = process.env.NODE_ENV || 'development';
ENV.APP_HOST = process.env.APP_HOST || '0.0.0.0';
ENV.APP_PORT = process.env.APP_PORT || '3000';
ENV.APP_NAME = process.env.APP_NAME || pkg.name;

ENV.STORMPATH_CLIENT_APIKEY_ID = process.env.STORMPATH_CLIENT_APIKEY_ID;
ENV.STORMPATH_CLIENT_APIKEY_SECRET = process.env.STORMPATH_CLIENT_APIKEY_SECRET;
ENV.STORMPATH_APPLICATION_HREF = process.env.STORMPATH_APPLICATION_HREF;

ENV.KONG_HOST = process.env.KONG_HOST || 'localhost';
ENV.KONG_PORT = process.env.KONG_PORT || '8001';
ENV.KONG_URL = process.env.KONG_URL || `http://${ENV.KONG_HOST}:${ENV.KONG_PORT}`;

ENV.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
ENV.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

ENV.COST_PER_QUERY = parseInt(process.env.COST_PER_QUERY) || 2;

ENV.EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET || uuid.v4();

module.exports = exports = ENV;
