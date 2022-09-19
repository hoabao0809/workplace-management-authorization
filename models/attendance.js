const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  details: [
    {
      startTime: { type: Date },
      endTime: { type: Date },
      workplace: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Attendance', attendanceSchema);
