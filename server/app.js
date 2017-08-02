const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const User = require('./models/user');
const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.use(require('./middleware/cookieParser'));
app.use(Auth.createSession);

app.get('/', Auth.isAuth, 
(req, res) => {
  res.render('index');
});

app.get('/create', Auth.isAuth,
(req, res) => {
  res.render('index');
});

app.get('/links', Auth.isAuth,
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', Auth.isAuth, (req, res, next) => {
  var url = req.body.url;
  // console.log('@@@@@@@@@2',!models.Links.isValidUrl(url))
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);

    })
    .catch(link => {
      res.status(200).send(link);
    });

});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  // var users = new Users();
  // console.log(username, password);
  return models.Users.get({username})
    .then((user) => {
      if (user) {
        throw user;
      }
      return models.Users.create({username, password});
    })
    .then(results=> {
      return models.Sessions.update({ hash: req.session.hash }, { userId: results.insertId });
    })
    .then(() => {
      res.redirect('/');
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(user => {
      res.redirect('/signup');
    });
});
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res, next) => {
  // console.log(req, '*************');
  var username = req.body.username;
  var attempted = req.body.password;
  // console.log(req)
  
  // console.log(req.session, '*******LOGIN SESSION');
  return models.Users.get({username})
    .then((success) => {

      var password = success.password;
      var salt = success.salt;
      // console.log(!success, '!!!!!!!!!!!!!!!')
      // console.log('@@@@@@@@@@@@@@@@@2',models.Users.compare(attempted, password, salt))
      if (!success || !models.Users.compare(attempted, password, salt)) {
        throw new Error('username and password do not match');
      }
      // console.log(req.session, '**** success login');
      return models.Sessions.update({ hash: req.session.hash }, { userId: success.id });
    })
    .then(() => {
      res.redirect('/');
    })
    .catch(() => {
    // console.log('reject!', reject);
      res.redirect('/login');
    })
    .error((error) => {
      res.status(500).send(error);
    });
// .then((success) => {
//     console.log('SUCCESS LOGIN', success);
//     res.redirect('/');
//   }).catch((failed) => {
//     console.log('FAILED', failed);
//     res.redirect('/login');
//   });
});

app.get('/logout', (req, res, next) => {
  return models.Sessions.delete({hash: req.cookies.shortlyid  })
    .then( (results) => {
      // console.log(results, 'RESULTS***');
      res.clearCookie('shortlyid');
      // console.log(req.cookies, '@@@@@@@@@@@')  
      res.redirect('/login');  
    })
    .error( (error) => {
      res.status(500).send(error);
    });
}); 


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
