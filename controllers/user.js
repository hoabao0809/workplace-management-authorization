const User = require('../models/user');
const Status = require('../models/status');

exports.getHome = (req, res) => {
  res.render('user/home', {
    pageTitle: 'Trang chủ',
    user: req.user,
    css: 'home',
  });
};

// check whether user has checked in?
exports.checkedIn = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  Status.findOne({ userId: req.user._id })
    .then((result) => {
      if (!result) {
        const status = new Status({
          userId: req.user._id,
          workplace: 'Chưa xác định',
          isWorking: false,
          attendId: null,
        });
        return status.save();
      } else {
        return result;
      }
    })
    .then((result) => {
      req.user.workplace = result.workplace;
      req.user.isWorking = result.isWorking;
      next();
    })
    .catch((err) => console.log(err));
};

exports.getUserDetail = (req, res) => {
  return res.render('user/user-detail', {
    pageTitle: 'Chi tiết nhân viên',
    user: req.user,
    css: 'user-detail',
  });
};

exports.postUserDetail = (req, res) => {
  req.user.image.unshift('/assets/images/avatars/' + req.file.filename);
  req.user.save();
  res.redirect('/user-detail');
};

exports.getStatistics = (req, res) => {
  req.user.getStatistics(null).then((statistics) => {
    res.render('statistics/statistics', {
      pageTitle: 'Tra cứu thông tin làm việc',
      css: 'statistics',
      user: req.user,
      statistics,
      type: 'details',
    });
  });
};

exports.setStatisticSearch = (req, res) => {
  const { type, search } = req.query;
  req.user.getStatistics({ type, search }).then((statistics) => {
    res.render('statistics/statistics', {
      pageTitle: 'Tìm kiếm thông tin',
      css: 'statistics',
      user: req.user,
      statistics,
      type,
      month: search,
    });
  });
};
