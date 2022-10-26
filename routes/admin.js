const express = require('express');
const adminRouter = express.Router();
const covidController = require('../controllers/covid');
const adminController = require('../controllers/admin');
const authController = require('../controllers/auth');

adminRouter.get(
  '/admin/covid-details',
  adminController.checkAuthorized,
  covidController.getStaffsCovid
);

// Login
adminRouter.get('/admin/login', adminController.getLogin);
adminRouter.post('/admin/login', adminController.postLogin);

adminRouter.get(
  '/admin/statistics-confirm',
  authController.didLoggedIn,
  adminController.checkAuthorized,
  adminController.confirmStatistics
);

adminRouter.get(
  '/admin/statistics-confirm/:userId',
  authController.didLoggedIn,
  adminController.checkAuthorized,
  adminController.getStatisticsByUser
);

adminRouter.post(
  '/admin/confirm-statisticsbymonth/:userId',
  authController.didLoggedIn,
  adminController.checkAuthorized,
  adminController.postConfirmStatistics
);



module.exports = adminRouter;
