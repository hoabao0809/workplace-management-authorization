const express = require('express');
const adminRouter = express.Router();
const covidController = require('../controllers/covid');
const adminController = require('../controllers/admin');

adminRouter.get(
  '/admin/covid-details',
  adminController.checkAuthorized,
  covidController.getStaffsCovid
);

// Login
adminRouter.get('/admin/login', adminController.getLogin);
adminRouter.post('/admin/login', adminController.postLogin);

// Logout
// adminRouter.post('/logout', adminController.postLogout);

module.exports = adminRouter;
