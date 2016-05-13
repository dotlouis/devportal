'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');
var request = require('request');
var log = require('../logger/logger').logger;
var ENV = require('../env');
var stripe = require('stripe')(ENV.STRIPE_SECRET_KEY);
var createApiKey = require('../utils/utils').createApiKey;

// Globals
var router = express.Router();

// Middlewares
router.use(bodyParser.urlencoded({ extended: true }));

// Routes
router.get('/', function(req, res) {
  res.render('dashboard');
});

router.post('/charge', function(req, res, next) {
  stripe.charges.create({
    amount: 2000,
    currency: 'usd',
    source: req.body.stripeToken,
    description: 'One time deposit for ' + req.user.email + '.'
  }, function(err, charge) {
    if (err) return next(err);
    req.user.customData.balance += charge.amount;
    req.user.customData.save(function(err) {
      if (err) return next(err);
      res.redirect('/dashboard');
    });
  });
});


router.post('/renew', function(req, res, next){
  var gatewayUrl = `${ENV.KONG_URL}/consumers/${req.user.username}/basic-auth`;
  request.get({
    uri:gatewayUrl,
    json: true
  }, function(err, response, body){
      if(err) next(err);
      if(!body.data || body.data.length < 1){
        err = `No apiKeys found for this consumer in gateway.`;
        res.status(500).send(err);
        next(new Error(err));
      }
      else{
        // delete the key from the gateway
        request.delete({
          uri: `${gatewayUrl}/${body.data[0].id}`,
          json: true
        }, function(err, response, body){
          if(err) next(err);
            req.log.info(`Deleted the apiKey from Gateway`);
            // res.redirect('/dashboard');

            // delete the key from stormpath
            request.delete({
              uri: req.user.apiKeys.items[0].href,
              json: true,
              auth: {
                username: ENV.STORMPATH_CLIENT_APIKEY_ID,
                password: ENV.STORMPATH_CLIENT_APIKEY_SECRET
              }
            }, function(err, response, body){
              console.log(body);
              if(err) next(err);
                req.log.info(`Deleted the apiKey from Stormpath`);

              createApiKey(req.user, req.log, function(){
                res.redirect('/dashboard');
                next();
              });
            });
        });
      }
  });

});

// Exports
module.exports = router;
