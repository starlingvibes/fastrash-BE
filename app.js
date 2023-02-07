const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const apiResponse = require('./helpers/apiResponse');
const userRoutes = require('./routes/userRoutes')
const cors = require('cors');
require('dotenv').config({path: './cofig.env'});

// DB connection
const MONGODB_URL = process.env.MONGODB_URL;
const mongoose = require('mongoose');

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    //don't show the log when it is test
    // if (process.env.NODE_ENV !== 'test') {
    //   console.log('Connected to %s', MONGODB_URL);
    //   console.log('App is running ... \n');
    //   console.log('Press CTRL + C to stop the process. \n');
    // }
    console.log('DAtabase connected successfully')
  })
  .catch((err) => {
    console.error('App starting error:', err.message);
    process.exit(1);
  });

const db = mongoose.connection; //eslint-disable-line no-unused-vars

const app = express();

//don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use('/', indexRouter);
app.use('/api/', apiRouter);
app.use('/alerts',userRoutes)
app.use('/alerts/id',userRoutes)

// throw 404 if URL not found
app.all('*', function (req, res) {
  return apiResponse.notFoundResponse(res, 'Page not found');
});

app.use((err, req, res) => {
  if (err.name == 'UnauthorizedError') {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
});

app.listen(8000, function () {
  console.log('listening successfully');
});

module.exports = app;