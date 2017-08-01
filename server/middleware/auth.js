const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  var cookies = parse.JSON(req.Cookies);
  console.log(req.session);
  
  
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

