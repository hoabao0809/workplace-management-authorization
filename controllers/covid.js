const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const pdf = require('pdf-creator-node');

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
          switch (action) {
            case 'view':
              return res.render('covid/covid-staffs', {
                pageTitle: 'Thông tin COVID-19 nhân viên',
                css: 'attendance-details',
                userArr,
              });

            case 'download':
              const html = fs.readFileSync(
                path.join(__dirname, '../views/covid/covid-staffs.ejs'),
                'utf-8'
              );
              const filename = 'report.pdf';

              const document = {
                html,
                data: userArr,
                path: './docs/' + filename,
              };

              pdf
                .create(document)
                .then((result) => {
                  const listPath = path.join('docs', filename);
                  const file = fs.createReadStream(listPath);
                  res.setHeader('Content-Type', 'application/pdf');
                  res.setHeader('Content-Disposition', 'inline');
                  file.pipe(res);
                })
                .catch((err) => console.log(err));
          }
        }
      });
    })
    .catch((err) => console.log(err));
};

// exports.getDownload = (req, res, next) => {
// const adminId = req.params.adminId;
// const listName = 'list-' + adminId + '.pdf';
// const listPath = path.join('data', 'listStaffCovid', listName);

// fs.readFile(listPath, (err, data) => {
//   if (err) {
//     return console.log(err);
//   }
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'inline; filename="' + listName + '"');
//   res.send(data);
// });

// const file = fs.createReadStream(listPath);
// res.setHeader('Content-Type', 'application/pdf');
// res.setHeader('Content-Disposition', 'inline; filename="' + listName + '"');
// file.pipe(res);

// ejs.renderFile(
//   path.join(__dirname, '..', 'views', 'covid', 'covid-staffs.ejs'),
//   (err, str) => {
//     if (err) {
//       console.log(err);
//     }

// pdf.create(str).toFile('list-staffs.pdf', (err, data) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log('file created');
// });
//     }
//   );
// };
