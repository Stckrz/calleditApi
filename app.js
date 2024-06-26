require('dotenv').config();
const { rateLimiter } = require("./middleware/rateLimiter")

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString);
const database = mongoose.connection

database.on("error", (error) => {
	console.log(error)
})

database.once('connected', () => {
	console.log("database connected")
})

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const predictionsRouter = require('./routes/predictions');
const commentsRouter = require('./routes/comments')

const app = express();
const port = process.env.PORT || 10000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/', rateLimiter);
app.use('/users', usersRouter);
app.use('/predictions', predictionsRouter);
app.use('/comments', commentsRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(5000, ()=>{
	console.log("Listening on port 5000")
})

module.exports = app;
