const parseCookies = (req, res, next) => {
  
  var cookie = req.headers.cookie;
  
  console.log(cookie, '@@@@@@@@@@');
  var cookies = {};
  
  if ( cookie ) {

    
    var split = cookie.split('; ');
    split.forEach(function(value) {
      var separated = value.split('=');
      var temp = separated[0];
      cookies[temp] = separated[1];
      console.log(separated);
    });
  } else {
    cookies = {};
    // cookies['shortlyid'] = '18ea4fb6ab3178092ce936c591ddbb90c99c9f66';
  }

  console.log(res.cookie, '!!!!!!!!!!!!!!!!!!');
  // res.cookie('shortlyId', cookies['shortyId']).send();
  req.cookies = cookies;
  console.log(cookies);
  // res.send();  
  // console.log(cookie)
  next();
};

module.exports = parseCookies;