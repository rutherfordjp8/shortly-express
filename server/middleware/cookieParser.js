const parseCookies = (req, res, next) => {
  
  var cookie = req.headers.cookie;
  
  var cookies = {};
  
  if ( cookie ) {
   
    var split = cookie.split('; ');
    split.forEach(function(value) {
      var separated = value.split('=');
      var temp = separated[0];
      cookies[temp] = separated[1];
    });
  } else {
    cookies = {};
  }
  req.cookies = cookies;
  next();
};

module.exports = parseCookies;