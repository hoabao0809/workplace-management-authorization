const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  isWorking: {
    type: Boolean,
    required: true,
  },
  workplace: {
    type: String,
    required: true,
  },
  attendId: {
    type: Schema.Types.ObjectId,
    ref: 'Attendance',
  },
});

module.exports = mongoose.model('Status', statusSchema);
