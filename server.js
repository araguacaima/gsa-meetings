const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
const passport = require('passport');

const json2md = require("json2md");
const settings = require('./config/settings');
const flash = require('connect-flash');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const configDB = require('./config/database');
const secrets = require('./config/auth').secrets;
const favicon = require('serve-favicon');
const path = require('path');

const WEB_PATH = '/web';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'calendar-token.json';
const calendarIdList = settings.calendarIds;

let params = {
    alwaysIncludeEmail: true,
    orderBy: 'startTime',
    showDeleted: false,
    showHiddenInvitations: true,
    singleEvents: true,
    timeMin: '2017-11-27T00:00:00Z',
    timeMax: '2017-12-01T23:59:59Z',
    fields: 'items(creator(displayName,email),description,end(date,dateTime),hangoutLink,htmlLink,id,organizer(displayName,email),source,start(date,dateTime),status,summary),summary'
};

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

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

function getEventsFromAllCalendars(auth) {
    calendarIdList.map(function (value) {
        listEvents(auth, params, value);
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param params_
 * @param calendarId
 */
function listEvents(auth, params_, calendarId) {
    const calendar = google.calendar('v3');
    if (params_ === undefined) {
        params_ = params;
    }
    params_.auth = auth;
    params_.calendarId = calendarId;
    calendar.events.list(params, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        const events = response.items;
        if (events.length === 0) {
            console.log('No upcoming events found.');
        } else {
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                const start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });
}

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
