const Admin = require('../models/admin');

exports.checkAuthorized = (req, res, next) => {
  console.log('USERRR', req.session.user);
  Admin.findOne({ email: req.session.user.email })
    .then((admin) => {
      if (!admin) {
        req.flash('error', 'Unauthorized! Please login again.');
        return res.redirect('/admin/login');
      }
      req.session.admin = admin;
      req.session.save((err) => {
        return next();
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash('error');
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    css: 'forms',
    type: 'login',
    errorMessage,
    role: 'admin',
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  Admin.findOne({ email, password })
    .then((admin) => {
      if (!admin) {
        req.flash('error', 'Invalid email or password');
        let errorMessage = req.flash('error');
        if (errorMessage.length > 0) {
          errorMessage = errorMessage[0];
        } else {
          errorMessage = null;
        }
        return res.render('auth/login', {
          pageTitle: 'Login',
          css: 'forms',
          type: 'login',
          errorMessage,
          role: 'admin',
        });
      }
      req.session.admin = admin;

      return req.session.save((err) => {
        console.log(err);
      });
    })
    .then((result) => {
      res.redirect('/admin/covid-details/?action=view');
    })
    .catch((err) => {
      console.log(err);
    });
};
