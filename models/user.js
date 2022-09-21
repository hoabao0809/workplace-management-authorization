const mongoose = require('mongoose');
const Status = require('../models/status');
const Attendance = require('../models/attendance');
const Absence = require('../models/absence');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  doB: {
    type: Date,
    required: true,
  },
  salaryScale: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  annualLeave: {
    type: Number,
    required: true,
  },
  image: [{ type: String, required: true }],
  role: {
    type: String,
    required: true
  }
});

userSchema.methods.checkStatus = function (type, workplace) {
  const user = this;
  let currAttendId;
  return Status.findOne({ userId: user._id }).then((status) => {
    currAttendId = status.attendId;

    switch (type) {
      case 'checkIn':
        return this.checkIn(currAttendId, new Date(), workplace)
          .then((result) => {
            currAttendId = result._id;
            return Status.findOne({ userId: user._id });
          })
          .then((_status) => {
            _status.attendId = currAttendId;
            _status.workplace = workplace;
            _status.isWorking = true;
            return _status.save();
          })
          .catch((err) => console.log(err)); 

      case 'checkOut':
        return this.checkOut(currAttendId, new Date())
          .then((_result) => {
            return Status.findOne({ userId: user._id });
          })
          .then((_status) => {
            _status.isWorking = false;
            _status.workplace = 'Chưa xác định';
            return _status.save();
          })
          .catch((err) => console.log(err));
    }
  });
};

// Check In
userSchema.methods.checkIn = function (attendId, startTime, workplace) {
  let date = startTime.toLocaleDateString();

  if (attendId) {
    return Attendance.findById(attendId).then((attendance) => {
      // Check if user has not checked out
      if (date === attendance.date) {
        attendance.details.unshift({
          startTime,
          endTime: null,
          workplace,
        });
        return attendance.save();
      } else {
        const newAttend = new Attendance({
          userId: this._id,
          date,
          details: [
            {
              startTime,
              endTime: null,
              workplace,
            },
          ],
        });
        return newAttend.save();
      }
    });
  } else {
    const newAttend = new Attendance({
      userId: this._id,
      date,
      details: [
        {
          startTime,
          endTime: null,
          workplace,
        },
      ],
    });
    return newAttend.save();
  }
};

// Check Out
userSchema.methods.checkOut = function (attendId, endTime) {
  return Attendance.findById(attendId).then((attendance) => {
    attendance.details[0].endTime = endTime;
    return attendance.save();
  });
};

userSchema.methods.getAttendanceDetails = function () {
  return Status.findOne({ userId: this._id }).then((status) => {
    return Attendance.findById(status.attendId)
      .then((result) => {
        return result;
      })
      .catch((err) => console.log(err));
  });
};

userSchema.methods.getStatistics = function (argument) {
  // Render search statistics page
  if (argument !== null) {
    const search = argument.search;
    switch (argument.type) {
      case 'jobDetail':
        const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
        const searchRgx = rgx(search);

        return this.renderStatistics({ date: searchRgx });

      case 'monthSalary':
        return this.renderStatistics({
          date: { $regex: `^${search}/` },
        });
    }
  }

  // Render fully-detailed statistics page
  return this.renderStatistics();
};

userSchema.methods.renderStatistics = function (arg) {
  const user = this;
  const statistics = [];
  let monthSalary = 0;

  return Attendance.find({ ...arg, userId: user._id })
    .exec()
    .then((attendances) => {
      attendances.forEach((attendance) => {
        if (!attendance.details[0].endTime) {
          attendance.totalTime = 'Chưa kết thúc';
        } else {
          attendance.totalTime = attendance.details.reduce((sum, detail) => {
            return sum + (detail.endTime - detail.startTime) / 3600000;
          }, 0);
          attendance.overTime =
            attendance.totalTime > 8 ? attendance.totalTime - 8 : 0;
          attendance.underTime =
            attendance.totalTime < 8 ? 8 - attendance.totalTime : 0;
        }

        if (typeof attendance.totalTime === 'string') {
          attendance.salary = '-';
        } else {
          attendance.salary =
            user.salaryScale * 3000000 +
            (attendance.overTime - attendance.underTime) * 200000;
          monthSalary = monthSalary + attendance.salary;
        }

        statistics.push({
          date: attendance.date,
          details: attendance.details,
          attend: true,
          totalTime: attendance.totalTime,
          overTime: attendance.overTime,
          underTime: attendance.underTime,
          salary: attendance.salary,
        });
      });

      return Absence.find({ ...arg, userId: this._id })
        .exec()
        .then((absences) => {
          absences.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
          });
          absences.forEach((absence) => {
            statistics.push({
              date: absence.date,
              reason: absence.reason,
              days: absence.days,
              attend: false,
            });
          });
          statistics.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
          });
          statistics.monthSalary = monthSalary;
          return statistics;
        });
    })
    .catch((err) => console.log(err));
};

module.exports = mongoose.model('User', userSchema);
