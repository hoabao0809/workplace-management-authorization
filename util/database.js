const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

const mongooseConnect = () => {
  return mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
};

module.exports = mongooseConnect;
