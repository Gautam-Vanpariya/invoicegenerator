const createError = require("http-errors");
const express = require("express");
const app = express();

const moment = require('moment');
require("moment-timezone");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const logger = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const flash = require('connect-flash');
const expressLayouts = require("express-ejs-layouts");


const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const requestIp = require("request-ip");

const INDEXROUTE = require("./routes/index.routes");
const APPSETTING = require("./configs/appSetting");

const sess = {
  secret : process.env.SESSION,
  resave : false,
  saveUninitialized : true,
};

if (app.get("env") === "production"){
  sess.store = MongoStore.create({ mongoUrl: process.env.DB_URI });
  app.set("trust proxy", 1);// trust first proxy
}
if (app.get("env") === "development"){
  sess.store = MongoStore.create({ mongoUrl: process.env.DB_URI });
  app.set("trust proxy", 1);// trust first proxy
}
app.use(session(sess));
// setup
app.use(cors());
app.use(flash());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: Infinity }));
app.use(cookieParser());
app.use(compression());

// client IP
app.use(requestIp.mw());

// layout setup
app.use(expressLayouts);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// public path
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app routes
app.locals.moment = moment;


//Routes
app.use('/', APPSETTING.printRequestLogger, INDEXROUTE);

app.all("*", function (req, res) {
  if(req.originalUrl.includes("/api") && "token" in req.headers){ // API
      return res.status(404).json({ success: false, message: "404! Page not found.", error: "error: Not found issue.", data: null });
  }else{ // WEB
     res.locals = { title: "Error 404" };
     res.render("pages/pages404", { layout: false });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;