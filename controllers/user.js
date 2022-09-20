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
  User.findById('62fa04cd85d21aefed61f0ca')
    .then((user) => {
      if (user) {
        req.user = user;
        return Status.findOne({ userId: user._id });
      }
    })
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
  User.findById(req.user._id)
    .then((user) => {
      res.render('user/user-detail', {
        pageTitle: 'Chi tiết nhân viên',
        user,
        css: 'user-detail',
      });
    })
    .catch((err) => console.log(err));
};

exports.postUserDetail = (req, res) => {
  const { id } = req.body;
  User.findById(id)
    .then((user) => {
      user.image.unshift('/assets/images/avatars/' + req.file.filename);
      user.save();
      res.redirect('/user-detail');
    })
    .catch((err) => console.log(err));
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
