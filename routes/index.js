const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const userController = require('../controllers/user');
const attendanceController = require('../controllers/attendance');
const absenceController = require('../controllers/absence');
const covidController = require('../controllers/covid');
const authController = require('../controllers/auth');

// Multer lib: save image
const imageStorage = multer.diskStorage({
  destination: 'public/assets/images/avatars/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const upload = multer({
  storage: imageStorage,
});

// Homepage
router.get('/', userController.getHome);

// Attendance page
router.get(
  '/attendance',
  authController.didLoggedIn,
  attendanceController.getAttendance
);
router.post(
  '/attendance',
  authController.didLoggedIn,
  attendanceController.postAttendance
);
router.get(
  '/attendance-details',
  authController.didLoggedIn,
  attendanceController.getAttendanceDetails
);

// Absence Page
router.get(
  '/absence',
  authController.didLoggedIn,
  absenceController.getAbsence
);
router.post(
  '/absence',
  authController.didLoggedIn,
  absenceController.postAbsence
);

// USer detail
router.get(
  '/user-detail',
  authController.didLoggedIn,
  userController.getUserDetail
);
router.post(
  '/user-detail',
  authController.didLoggedIn,
  upload.single('image'),
  userController.postUserDetail
);

// Statistic
router.get(
  '/statistics',
  authController.didLoggedIn,
  userController.getStatistics
);
router.get(
  '/statistic-search',
  authController.didLoggedIn,
  userController.setStatisticSearch
);

// Covid page
router.get('/covid', authController.didLoggedIn, covidController.getCovid);
router.get(
  '/covid-details',
  authController.didLoggedIn,
  covidController.getCovidDetails
);
router.post('/covid', authController.didLoggedIn, covidController.postCovid);




module.exports = router;
