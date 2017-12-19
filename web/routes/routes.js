const auth = require('../../config/auth').googleAuth;
const calendars = require('../../app/calendars');
const googleTools = require('../../app/googleTools');
const dateFormatRFC3339 = require('../../config/settings').dateFormatRFC3339;
const timezone = require('../../config/settings').timezone;
const showableDateFormat = require('../../config/settings').showableDateFormat;

module.exports = function (router, passport) {

    // show the home page (will also have our login links)
    router.get('/', ensureAuthenticated, function (req, res) {
        res.render('index', {
            title: 'GSA Tools',
            config: auth,
            authorised: req.isAuthenticated()
        });
    });


    // show the home page (will also have our login links)
    router.get('/calendars-details', ensureAuthenticated, function (req, res) {
        calendars.getEvents(req, function (calendarIds) {
            res.render('calendars-details', {
                title: 'GSA | Calendars Details',
                calendarIds: calendarIds,
                authorised: req.isAuthenticated()
            });
        }, function (err) {
            res.redirect('/logout');
        });
    });

    // show the home page (will also have our login links)
    router.get('/calendars', ensureAuthenticated, function (req, res) {
        calendars.get(req, function (calendarIds) {
            res.render('calendars', {
                title: 'GSA | Calendars',
                calendarIds: calendarIds,
                authorised: req.isAuthenticated(),
                dateFormat: dateFormatRFC3339,
                timezone: timezone,
                showableDateFormat: showableDateFormat
            });
        }, function (err) {
            res.redirect('/logout');
        });
    });

    // show the home page (will also have our login links)
    router.get('/picker', ensureAuthenticated, function (req, res) {
        res.render('picker', {
            title: 'GSA | Picker',
            config: auth,
            authorised: req.isAuthenticated()
        });
    });

    router.get('/login',
        function (req, res) {
            res.render('login', {
                title: 'GSA | Authentication'
            })
        });

    router.get('/profile', ensureAuthenticated, function (req, res) {
        res.render('profile', {
            user: req.user,
            title: 'GSA Profile',
            authorised: req.isAuthenticated()
        });
    });

    // LOGOUT ==============================
    router.get('/logout', function (req, res) {
        googleTools.deleteCredentials(req.cookies.userId, function (err) {
            req.logout();
            if (err) {
                res.redirect('/login');
            } else {
                res.redirect('/');
            }
        });
    });

    // send to google to do the authentication
    router.get('/auth/google',
        passport.authenticate('google', {
                scope: ['profile', 'email'].concat(auth.scopes),
                access_type: "offline"
            }
        ));

    // the callback after google has authenticated the user

    router.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

    // send to google to do the authentication
    router.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));

    // the callback after google has authorized the user
    router.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

    router.get('/unlink/google', ensureAuthenticated, function (req, res) {
        res.redirect('/login');
    });

};

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        if (googleTools.checkForCredentials()) {
            res.redirect('/auth/google');
        } else {
            // res.cookie("google_auth_renew_token", true);
            // req.cookies.google_auth_renew_token = true;
            res.redirect('/login');
        }
    }
}

