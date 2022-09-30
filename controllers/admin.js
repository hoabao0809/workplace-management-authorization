const Admin = require('../models/admin');
const Attendance = require('../models/attendance');
const User = require('../models/user');

exports.checkAuthorized = (req, res, next) => {
  Admin.findOne({ email: req.session.user.email })
    .then((admin) => {
      if (!admin) {
        // Check logged-in user's email matches admin's email
        if (!req.session.admin) {
          req.flash('error', 'Unauthorized! Please login again.');
          return res.redirect('/admin/login');
        } else if (req.session.admin.email !== req.session.user.email) {
          req.flash(
            'error',
            'Unauthorized! You are not allowed to access this section'
          );
          return res.redirect('/admin/login');
        }
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

      return req.session.save();
    })
    .then((result) => {
      res.redirect('/admin/covid-details?action=view');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.confirmStatistics = (req, res, next) => {
  return User.find({ adminId: req.session.admin._id })
    .exec()
    .then((users) => {
      return res.render('statistics/statistics-confirm', {
        pageTitle: 'Xác nhận dữ liệu giờ làm',
        css: 'attendance-details',
        users,
      });
    });
};

exports.getStatisticsByUser = (req, res, next) => {
  const userId = req.params.userId;
  const { search } = req.query;
  const type = 'monthSalary';
  const currentMonth = new Date().getMonth() + 1;

  if (req.query.dateDeleted) {
    const dateDeleted = new Date(req.query.dateDeleted).toLocaleDateString();
    Attendance.deleteOne({ date: dateDeleted })
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }

  return User.findOne({ _id: userId }).then((user) => {
    user
      .getStatistics({ type, search: search || currentMonth })
      .then((statistics) => {
        res.render('statistics/statistics-byuser', {
          pageTitle: 'Xác nhận dữ liệu giờ làm', 
          type, 
          month: search || currentMonth, 

          css: 'statistics',
          user: req.user,
          statistics,
          userId,
          user,
        });
      });
  });
};

exports.postConfirmStatistics = async (req, res, next) => {
  const userId = req.params.userId;
  const { monthConfirmed } = req.body;

  const result = await Attendance.updateMany(
    {
      userId,
      date: { $regex: `^${monthConfirmed}/` },
    },
    { confirmed: true }
  );

  if (result.acknowledged) {
    res.redirect('/');
  }
};
