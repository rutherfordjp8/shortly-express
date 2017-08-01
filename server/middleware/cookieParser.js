const parseCookies = (req, res, next) => {
  
  var cookie = JSON.stringify(req.cookies).slice(1, -1);

  console.log(cookie, '@@@@@@@@@@')
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
    
    cookies['shortlyid'] = '18ea4fb6ab3178092ce936c591ddbb90c99c9f66';
  }

  console.log(res.cookie, '!!!!!!!!!!!!!!!!!!');
  // res.cookie('shortlyId', cookies['shortyId']).send();

  console.log(res.cookie);
  // res.send();  
  // console.log(cookie)
};

module.exports = parseCookies;