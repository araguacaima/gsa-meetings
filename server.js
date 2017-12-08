const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
const passport = require('passport');

const json2md = require("json2md");
const WEB_PATH = '/web';
const flash = require('connect-flash');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const configDB = require('./config/database');
const secrets = require('./config/auth').secrets;
const auth = require('./config/auth').googleAuth;
const favicon = require('serve-favicon');
const path = require('path');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

let google = require('googleapis');
let OAuth2 = google.auth.OAuth2;
let oauth2Client = new OAuth2(
    auth.client_id,
    auth.client_secret,
    auth.redirect_uris[1]
);

// set auth as a global default
google.options({
    auth: oauth2Client
});

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));

app.set('views', path.join(__dirname + WEB_PATH, 'views'));
app.set('view engine', 'pug'); // set up ejs for templating

// required for passport
app.use(session({
    secret: secrets.passport, // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(favicon(path.join(__dirname + WEB_PATH, 'public', 'favicon.ico')));

// set a cookie for temporally storing google code
app.use(function (req, res, next) {
    // check if client sent cookie
    let cookie = req.cookies.google_auth_code;
    const user = req.user;
    if (cookie === undefined || cookie === 'undefined') {
        if (req.query.code === undefined) {
            res.clearCookie("google_auth_code");
        } else {
            console.log("Saved cookie with new google oauth code");
            if (user) {
                res.cookie("google_auth_renew_token", true);
                req.cookies.google_auth_renew_token = true;
                resetUser(user);
            }
            res.cookie('google_auth_code', req.query.code);
        }
    } else {
        if (req.query.code !== undefined && cookie !== req.query.code) {
            console.log("Saved cookie with new google oauth code");
            if (user) {
                res.cookie("google_auth_renew_token", true);
                req.cookies.google_auth_renew_token = true;
                resetUser(user);
            }
            res.cookie('google_auth_code', req.query.code);
        }
    }
    next();
});


function resetUser(user, callback) {
    user.google.token = undefined;
    user.save(function (err) {
        if (!err) {
            if (callback !== undefined && typeof callback === 'function') {
                callback();
            }
        }
    });
}

app.use(express.static(path.join(__dirname + WEB_PATH, 'public')));


// error handlers

// development error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

// production error handler
// no stacktraces leaked to user
/*app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});*/


/*
console.log(json2md([
    { h1: "JSON To Markdown" }
  , { blockquote: "A JSON to Markdown converter." }
  , { img: [
        { title: "Some image", source: "https://example.com/some-image.png" }
      , { title: "Another image", source: "https://example.com/some-image1.png" }
      , { title: "Yet another image", source: "https://example.com/some-image2.png" }
      ]
    }
  , { h2: "Features" }
  , { ul: [
        "Easy to use"
      , "You can programatically generate Markdown content"
      , "..."
      ]
    }
  , { h2: "How to contribute" }
  , { ol: [
        "Fork the project"
      , "Create your branch"
      , "Raise a pull request"
      ]
    }
  , { h2: "Code blocks" }
  , { p: "Below you can see a code block example." }
  , { "code": {
        language: "js"
      , content: [
          "function sum (a, b) {"
        , "   return a + b"
        , "}"
        , "sum(1, 2)"
        ]
      }
    }
]));
*/


// routes ======================================================================
require('./web/routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Port ' + port);
