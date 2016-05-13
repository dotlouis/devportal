'use strict';

var async = require('async');
var express = require('express');
var request = require('request');
var log = require('./logger/logger').logger;
var requestLogger = require('./logger/logger').requestLogger;
var errorLogger = require('./logger/logger').errorLogger;
var errorHandler = require('./error-handler/error-handler').errorHandler;
var shutdownOnError = require('./error-handler/error-handler').shutdownOnError;
var pug = require('pug');
var stormpath = require('express-stormpath');
var ENV = require('./env');
var createApiKey = require('./utils/utils').createApiKey;

var privateRoutes = require('./routes/private');
var publicRoutes = require('./routes/public');

// Globals
var app = express();

// Application settings
app.engine('pug', pug.__express);
app.set('view engine', 'pug');
app.set('views', './views');

app.locals.costPerQuery = ENV.COST_PER_QUERY;
app.locals.supportEmail = ENV.SUPPORT_EMAIL;
app.locals.stripePublishableKey = ENV.STRIPE_PUBLISHABLE_KEY;

// Middlewares
app.use('/static', express.static('./static', {
  index: false,
  redirect: false
}));
app.use('/static', express.static('./bower_components', {
  index: false,
  redirect: false
}));
app.use(requestLogger);
app.use(stormpath.init(app, {
  apiKey: {
    id: ENV.STORMPATH_CLIENT_APIKEY_ID,
    secret: ENV.STORMPATH_CLIENT_APIKEY_SECRET
  },
  application: {
    href: ENV.STORMPATH_APPLICATION_HREF
  },
  enableAccountVerification: true,
  expand: {
    customData: true,
    apiKeys: true
  },
  web: {
    register: {
      autoLogin: true,
      nextUri: '/dashboard',
      form: {
        fields: {
          givenName: {
            required: false
          },
          surname: {
            required: false
          }
        }
      }
    }
  },
  secretKey: ENV.EXPRESS_SESSION_SECRET,
  postRegistrationHandler: function(account, req, res, next) {
    req.log.info(`Creating account for ${account.email}`);
    async.parallel([
      // Set the user's default settings.
      function(cb) {
        account.customData.balance = 0;
        account.customData.totalQueries = 0;
        account.customData.save(function(err) {
          if (err) return cb(err);
          cb();
        });
      },

      function(cb) {

        // create consumer in Kong
        request.post({
          uri: `${ENV.KONG_URL}/consumers`,
          json: true,
          body: {
            username: account.email,
            custom_id: getIdFromHref(account.href)
          }
        }, function(err, response, consumer){
          if(err) cb(err);
          if(!consumer.id){
            cb(new Error(`Consumer already exist in gateway.`));
          }
          else{
            req.log.info(`Consumer created in gateway`);
            // create apiKeys in Kong and stormpath
            createApiKey(account, req.log, cb);
          }
        });

      }
    ], function(err){
      if(err){
        req.log.error(err);
        res.locals.error = {
          status: 500,
          message: err
        };
        res.status(res.locals.error.status).render('error');
      }
      else
        next();
    });
  }
}));

// Routes
app.use('/', publicRoutes);
app.use('/dashboard', stormpath.loginRequired, privateRoutes);

// error handlers (order matters)
app.use(errorHandler);
app.use(errorLogger);
app.use(shutdownOnError);

// Server
app.on('stormpath.ready',()=>{
  let server = app.listen(ENV.APP_PORT, ()=>{
    let {address,port} = server.address();
    log.info(`Webapp available at http://${address}:${port}`);
  });
});


function getIdFromHref(href){
  return href.substr(href.lastIndexOf('/') + 1);
}
