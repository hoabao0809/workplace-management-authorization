const Covid = require('../models/covid');
const Admin = require('../models/admin');
const User = require('../models/user');

// const adminController = require('../models/admin');

exports.getCovid = (req, res) => {
  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
      if (!covid) {
        const newCovid = new Covid({
          userId: req.user._id,
          bodyTemps: [],
          vaccine: [],
          positive: [],
        });
        return newCovid.save();
      }
      return covid;
    })
    .then((covid) => {
      res.render('covid/covid', {
        pageTitle: 'Thông tin COVID-19',
        css: 'covid',
        user: req.user,
        vaccine: covid.vaccine,
      });
    })
    .catch((err) => console.log(err));
};

// Post Covid Details Page
exports.postCovid = (req, res, next) => {
  const type = req.query.type;
  const name = req.session.user.name;
  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
      // Check type of covid-form (temperature, vaccine, positive)
      if (type === 'temperature') {
        covid.bodyTemps.push({
          date: new Date(),
          temperature: req.body.temperature,
        });
      } else if (type === 'positive') {
        covid.positive.push({ date: req.body.positive });
      } else {
        const { vaccineDate, vaccineName } = req.body;
        covid.vaccine.push({ name: vaccineName, date: vaccineDate });
      }
      covid.name = name;
      return covid.save();
    })
    .then((covid) => {
      return res.redirect('/covid-details');
    })
    .catch((err) => console.log(err));
};

// Get Covid Details Page
exports.getCovidDetails = (req, res, next) => {
  // Get Covid Details by User
  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
      // Check if user has no covid data
      if (covid) {
        return covid;
      } else {
        const newCovid = new Covid({
          userId: req.user._id,
          bodyTemperatures: [],
          vaccine: [],
          positive: [],
        });
        return newCovid.save();
      }
    })
    .then((covid) => {
      res.render(`covid/covid-details`, {
        css: 'covid',
        pageTitle: 'Thông tin Covid',
        user: req.user,
        covid: covid,
      });
    })
    .catch((err) => console.log(err));
};

// Get COVID-19 details of all staffs
exports.getStaffsCovid = (req, res, next) => {
  // const userArr = [];

  return User.find({ adminId: req.session.admin._id })
    .exec()
    .then((users) => {
      const userIds = [];
      users.map((user) => userIds.push(user._id));
      return userIds;
    })
    .then((userIds) => {
      return Covid.find({ userId: userIds }).then((userArr) => {
        if (userArr) {
          res.render('covid/covid-staffs', {
            pageTitle: 'Thông tin COVID-19 nhân viên',
            css: 'attendance-details',
            userArr,
          });
        }
      });
    })
    .catch((err) => console.log(err));
};
