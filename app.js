require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('./models/connection')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/utilisateurs');
var produitsRouter = require('./routes/produits');
<<<<<<< HEAD
var listesRouter = require('./routes/listes');
=======
var listeRouter = require('./routes/liste');
>>>>>>> 0d529f88493227aff737875f6773b84b89d60830

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
<<<<<<< HEAD
app.use('/listes', listesRouter);
=======
app.use('/liste', listeRouter);
>>>>>>> 0d529f88493227aff737875f6773b84b89d60830

module.exports = app;
