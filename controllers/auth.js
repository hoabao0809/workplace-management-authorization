const { resolveInclude } = require('ejs');

exports.getLogin = (req, res, next) => {
  console.log(req.session);
  res.render('auth/login', {
    pageTitle: 'Login',
    css: 'forms',
    type: 'login'
  });
};

exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn = true;
  res.redirect('/');
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.didLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.redirect('/login');
  }
  next();
};
