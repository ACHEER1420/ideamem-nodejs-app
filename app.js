require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');

const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');

// Load User Model
require('./src/models/User');
require('./src/models/story');

// Passport Config
require('./src/configs/passport')(passport);

mongoose
  .connect(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((error) => console.log(error));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handlebars Middleware
app.engine(
  'handlebars',
  exphbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set('view engine', 'handlebars');

// Load Routes
const authRoutes = require('./src/routes/auth');
const indexRoutes = require('./src/routes/index');
const storyRoutes = require('./src/routes/stories');

//
app.use(cookieParser());
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middelware
app.use(passport.initialize());
app.use(passport.session());

// Set global variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Set static folder
app.use(express.static(path.join(__dirname, 'src/public')));

// Use Routes
app.use('/auth', authRoutes);
app.use('', indexRoutes);
app.use('/stories', storyRoutes);

const _PORT = process.env.PORT || 5000;

app.listen(_PORT, () => {
  console.log(`Application is running on port ${_PORT}`);
});
