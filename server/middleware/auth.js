const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  // console.log('Create Session, session: ', req.cookies);
  // console.log('Create Session, session: ', req.sessions);
  
  Promise.resolve(req.cookies.shortlyid)
  .then((hash) => {
    if (!hash){throw hash;}
    return models.Sessions.get({hash});
  })
  .tap( (session) => {
    if(!session) {
      throw session;
    }
  })
  .catch(() =>{
    return models.Sessions.create()
      .then((results) => {
      
    // console.log(results, 'dsafdasvajhdksfjel;asfj')
        return models.Sessions.get({id: results.insertId});
      })
      .tap((results) => {
        res.cookie('shortlyid', results.hash);
      });
  })
  .then((results) => {
    req.session = results;
    next();
  });
  



  // // console.log(req.body.username, '@@@@@@@@@@@');  
  // session = {};
  //   // console.log(req, '!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  // console.log(req.cookies, '**** BEFORE WE SET *****', !!req.cookies[0]);
  // if (JSON.stringify(req.cookies) === '{}') {
  //   models.Sessions.create().then((results) => {
      
  //     models.Sessions.get({'id': results.insertId}).then((result) => {
  //       console.log(result, 'thisisresult');
  //       session.hash = result.hash;
  //       req.session = session;
  //       res.cookies = {'shortlyid': {'value': session.hash}};
  //       // console.log(res.headers);
  //       console.log(result, '***********');
  //         if (result.userId) {
  //           console.log(results.userId, '********** FOUND USER ID ********');
  //           models.Users.get({id: result.userId}).then((results) => {
  //             req.session.user.username = results.username;
  //             console.log(results, 'FUCKFUCKFUCKFUCKFUCKFUCKFUCKFUCK');
  //           });

  //         }
  //       next();
  //     });
  //     // console.log(req.session);
  //     // req.session = results;
  //     // req.session.user = req.body.username;
  //     // req.session.password = req.body.password;
  //   });
  // } else if (req.username) {
  //   console.log(req.sessi)
  //   next();
  // }
  
  
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
module.exports.isAuth = (req, res, next) => {
  console.log('FUCK',models.Sessions.isLoggedIn(req.session))
  if (models.Sessions.isLoggedIn(req.session)) {
    next();
  } else {
    res.redirect('/login');
  }
};
