const User = require('../models/user');
const Status = require('../models/status');
const Admin = require('../models/admin');

exports.getHome = (req, res) => {
  console.log(req.session.statisticsConfirmed);
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

exports.getStatistics = (req, res, next) => {
  const page = +req.query.page || 1;
  const itemsPerPage = +req.query.itemsPerPage || 3;
  let admin;

  Admin.findOne({ _id: req.user.adminId }).then((admin) => {
    if (!admin) {
      next();
    }

    req.user.getStatistics(null).then((statistics) => {
      const totalItems = statistics.length;
      const currStatistics = statistics.splice(
        (page - 1) * itemsPerPage,
        itemsPerPage
      );

      res.render('statistics/statistics', {
        pageTitle: 'Tra cứu thông tin làm việc',
        type: 'details',
        css: 'statistics',
        user: req.user,
        statistics: currStatistics,
        admin,
        currentPage: page,
        itemsPerPage,
        hasNextPage: itemsPerPage * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / itemsPerPage),
      });
    });
  });
};

exports.setStatisticSearch = (req, res) => {
  let admin;
  const { type, search } = req.query;

  Admin.findOne({ _id: req.user.adminId }).then((admin) => {
    if (!admin) {
      next();
    }

    req.user.getStatistics({ type, search }).then((statistics) => {
      res.render('statistics/statistics', {
        pageTitle: 'Tìm kiếm thông tin', //note
        type, //note
        month: search, //note

        css: 'statistics',
        user: req.user,
        statistics,
        admin,
      });
    });
  });
};
