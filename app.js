const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const dbConnect = require('./util/database');
const userRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRouter = require('./routes/admin');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');


const User = require('./models/user');
const Admin = require('./models/admin');

const userController = require('./controllers/user');

const app = express();

// Store session in database
const MONGODB_URI = process.env.MONGODB_URI;
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
const csrfProtection = csrf();

// Template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Define Static Folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use(userController.checkedIn);

// Routes
app.use(userRoutes);
app.use(authRoutes);
app.use(adminRouter);

// Connect to mongoDb
dbConnect()
  .then((result) => {
    User.findOne()
      .then((user) => {
        if (!user) {
          const user = new User({
            name: 'Đặng Nguyễn Bảo Hòa',
            doB: new Date('1996-09-08'),
            salaryScale: 1,
            startDate: new Date('2022-01-01'),
            department: 'IT',
            annualLeave: 13,
            image: ['/assets/images/avatars/avatar.png'],
            role: 'staff',
            email: 'abcd1234@gmail.com',
            password: 'abcd1234',
          });
          user.save();
        }
        app.listen(3001);
        console.log('Connected');
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
