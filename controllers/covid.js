const fs = require('fs');
const path = require('path');
const pdf = require('pdf-creator-node');

const Covid = require('../models/covid');
const User = require('../models/user');

const options = require('../helpers/options');

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
  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
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
  const action = req.query.action;

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
          // Check query action
          switch (action) {
            case 'view':
              return res.render('covid/covid-staffs', {
                pageTitle: 'Thông tin COVID-19 nhân viên',
                css: 'attendance-details',
                userArr,
              });

            case 'download':
              return res.render(
                'covid/covid-download',
                {
                  pageTitle: 'Thông tin COVID-19 nhân viên',
                  userArr,
                },
                (err, html) => {
                  if (err) {
                    console.log(err);
                  }
                  const filename = 'report.pdf';

                  const document = {
                    html,
                    data: {},
                    path: './docs/' + filename,
                  };

                  pdf
                    .create(document, {
                      childProcessOptions: {
                        format: 'A4',
                        orientation: 'portrait',
                        border: '10mm',
                        header: {
                          height: '45mm',
                        },
                        footer: {
                          height: '28mm',
                        },
                        env: { OPENSSL_CONF: '/dev/null' },
                      },
                    })
                    .then((result) => {
                      const listPath = path.join('docs', filename);
                      const file = fs.createReadStream(listPath);
                      res.setHeader('Content-Type', 'application/pdf');
                      res.setHeader('Content-Disposition', 'inline');
                      file.pipe(res);
                    })
                    .catch((err) => console.log(err));
                }
              );
          }
        }
      });
    })
    .catch((err) => console.log(err));
};
