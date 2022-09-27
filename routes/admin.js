const express = require('express');
const adminRouter = express.Router();
const covidController = require('../controllers/covid');
const adminController = require('../controllers/admin');

adminRouter.post(
  '/admin/covid-details',
  adminController.checkAuthorized,
  covidController.getStaffsCovid
);

// Login
adminRouter.get('/admin/login', adminController.getLogin);
adminRouter.post('/admin/login', adminController.postLogin);


module.exports = adminRouter;
