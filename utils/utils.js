var request = require('request');
var ENV = require('../env');

function createApiKey(stormpathAccount, log, cb){
  // create apiKey in stormpath
  stormpathAccount.createApiKey(function(err, key){
    if (err) return cb(err);
    log.info(`apiKey created in stormpath: ${key.id}`);

    var url = `${ENV.KONG_URL}/consumers/${stormpathAccount.username}/basic-auth`;
    // create apiKey in Kong
    request.post({
      uri: url,
      json: true,
      body: {
        username: key.id,
        password: key.secret
      }
    }, function(err, response, body){
      if(err) cb(err);
      log.info(`apikey registered in gateway as basic auth`);
      cb();
    });
  });
}

module.exports = exports = {
  createApiKey: createApiKey
};
