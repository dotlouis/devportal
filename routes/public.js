'use strict';

var express = require('express');
var stormpath = require('express-stormpath');

// Globals
var router = express.Router();

router.use(stormpath.getUser);

// Routes
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/pricing', function(req, res) {
  res.render('pricing');
});

router.get('/docs', function(req, res) {
  res.render('docs');
});

// Exports
module.exports = router;
