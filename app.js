var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');

var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/user');
var loginRouter = require('./src/routes/login');
var joinRouter = require('./src/routes/join');
var mypageRouter = require('./src/routes/mypage');
var usersAdminRouter = require('./src/routes/admin/user');
var categoryRouter = require('./src/routes/admin/category');
var authRouter = require('./src/routes/admin/auth');
var dashboardRouter = require('./src/routes/admin/dashboard');
const productRouter = require('./src/routes/product');

var app = express();
app.use(cors());

// 정적 파일 서버 설정
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 메인
app.use('/', indexRouter);

app.use('/products', productRouter);

app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/join', joinRouter);
app.use('/mypage', mypageRouter);
app.use('/admin/users', usersAdminRouter);
app.use('/admin/category', categoryRouter);
app.use('/admin/auth', authRouter);
app.use('/admin/dashboard', dashboardRouter);

// 유저 상품 관리
app.use('/products', productRouter);

// 유저 후기 & 문의 관리
const commentRouter = require('./src/routes/comment');
app.use('/products', commentRouter);

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

module.exports = app;
