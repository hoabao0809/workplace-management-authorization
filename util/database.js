const mongoose = require('mongoose');

const mongooseConnect = () => {
  return mongoose.connect(
    'mongodb+srv://hoabao0809:admin1234@hrmapp.ataq6on.mongodb.net/test?retryWrites=true&w=majority'
  );
};

module.exports = mongooseConnect;
 