const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const absenceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
});

absenceSchema.statics.addAbsence = function (
  userId,
  type,
  date,
  hours,
  dates,
  reason
) {
  if (type == 1) {
    const dateArr = dates.split(',');
    const newAbsence = [];
    dateArr.forEach((date) => {
      newAbsence.push({
        userId,
        date: new Date(date).toLocaleDateString(),
        days: 1,
        reason,
      });
    });
    return this.insertMany(newAbsence);
  } else if (type == 0) {
    const newAbsence = {
      userId,
      date: new Date(date).toLocaleDateString(),
      days: hours / 8,
      reason,
    };
    return this.create(newAbsence);
  }
};

module.exports = mongoose.model('Absence', absenceSchema);
