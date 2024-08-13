require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//require("./models/connection");
const auth = require('./modules/auth');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/utilisateurs');
var produitsRouter = require('./routes/produits');

var app = express();
const cors = require('cors');
app.use(cors());

const helmet = require('helmet');
app.use(helmet());

app.use(logger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/utilisateur', usersRouter);
app.use('/produits', produitsRouter);

module.exports = app;
