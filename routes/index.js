const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const userController = require('../controllers/user');
const attendanceController = require('../controllers/attendance');
const absenceController = require('../controllers/absence');
const covidController = require('../controllers/covid');

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
router.get('/attendance', attendanceController.getAttendance);
router.post('/attendance', attendanceController.postAttendance);
router.get('/attendance-details', attendanceController.getAttendanceDetails);

// Absence Page
router.get('/absence', absenceController.getAbsence);
router.post('/absence', absenceController.postAbsence);

// USer detail
router.get('/user-detail', userController.getUserDetail);
router.post(
  '/user-detail',
  upload.single('image'),
  userController.postUserDetail
);

// Statistic
router.get('/statistics', userController.getStatistics);
router.get('/statistic-search', userController.setStatisticSearch)

// Covid page
router.get('/covid', covidController.getCovid);
router.get('/covid-details', covidController.getCovidDetails);
router.post('/covid', covidController.postCovid);

module.exports = router;
