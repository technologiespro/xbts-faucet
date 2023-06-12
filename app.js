const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
//var logger = require('morgan');
const jsonFile = require('jsonfile');
const scamIps = jsonFile.readFileSync('./ScamIps.json');
process.env.PORT = jsonFile.readFileSync('./config.json').port;
console.log("BitShares Faucet Running on port:", process.env.PORT);

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.disable('x-powered-by');

// Custom Middleware
app.use((req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    //console.log('ip', ip)
    if (scamIps.includes(ip)) {
        // Invalid ip
        console.log("Scam IP: " + ip);
        //next(); // удалить после тестов
        res.json(null);
        //next(err);
    } else {
        next();
    }
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
