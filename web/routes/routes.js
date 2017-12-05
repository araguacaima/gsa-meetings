const auth = require('../../config/auth').googleAuth;
const calendars = require('../../app/calendars');
const googleTools = require('../../app/googleTools');

module.exports = function (router, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    router.get('/', ensureAuthenticated, function (req, res) {
        res.render('index', {
            title: 'GSA Tools'
        });
    });

    // show the home page (will also have our login links)
    router.get('/calendars', isLoggedIn, function (req, res) {
        googleTools.getCredentials(function (credentials) {
            calendars.get(credentials);
        });
        // calendars.get(tokenPath);
        res.render('calendars', {
            title: 'GSA | Calendars'
        });
    });

    // show the home page (will also have our login links)
    router.get('/picker', isLoggedIn, function (req, res) {
        res.render('picker', {
            title: 'GSA | Picker',
            config: auth
        });
    });

    router.get('/login',
        function (req, res) {
            res.render('login', {
                title: 'GSA | Authentication'
            })
        });

    // PROFILE SECTION =========================
    router.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile', {
            user: req.user,
            title: 'GSA Profile'
        });
    });

    // LOGOUT ==============================
    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });


    router.get('/about', function (req, res) {
        res.render('about', {
            title: 'About'
        });
    });

    router.get('/contact', function (req, res) {
        res.render('contact', {
            title: 'Contact'
        });
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

//    // locally --------------------------------
//        // LOGIN ===============================
//        // show the login form
//        router.get('/login', function(req, res) {
//            res.render('/login-local', { message: req.flash('loginMessage') });
//        });
//
//        // process the login form
//        router.post('/login', passport.authenticate('local-login', {
//            successRedirect : '/profile', // redirect to the secure profile section
//            failureRedirect : '/login', // redirect back to the signup page if there is an error
//            failureFlash : true // allow flash messages
//        }));
//
//        // SIGNUP =================================
//        // show the signup form
//        router.get('/signup', function(req, res) {
//            res.render('/signup', { message: req.flash('signupMessage') });
//        });
//
//        // process the signup form
//        router.post('/signup', passport.authenticate('local-signup', {
//            successRedirect : '/profile', // redirect to the secure profile section
//            failureRedirect : '/signup', // redirect back to the signup page if there is an error
//            failureFlash : true // allow flash messages
//        }));
//
//    // facebook -------------------------------
//
//        // send to facebook to do the authentication
//        router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));
//
//        // handle the callback after facebook has authenticated the user
//        router.get('/auth/facebook/callback',
//            passport.authenticate('facebook', {
//                successRedirect : '/profile',
//                failureRedirect : '/'
//            }));
//
//    // twitter --------------------------------
//
//        // send to twitter to do the authentication
//        router.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
//
//        // handle the callback after twitter has authenticated the user
//        router.get('/auth/twitter/callback',
//            passport.authenticate('twitter', {
//                successRedirect : '/profile',
//                failureRedirect : '/'
//            }));


    // google ---------------------------------

    // send to google to do the authentication
    router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    // the callback after google has authenticated the user

    router.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

//    // locally --------------------------------
//        router.get('/connect/local', function(req, res) {
//            res.render('/connect-local', { message: req.flash('loginMessage') });
//        });
//        router.post('/connect/local', passport.authenticate('local-signup', {
//            successRedirect : '/profile', // redirect to the secure profile section
//            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
//            failureFlash : true // allow flash messages
//        }));
//
//    // facebook -------------------------------
//
//        // send to facebook to do the authentication
//        router.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));
//
//        // handle the callback after facebook has authorized the user
//        router.get('/connect/facebook/callback',
//            passport.authorize('facebook', {
//                successRedirect : '/profile',
//                failureRedirect : '/'
//            }));
//
//    // twitter --------------------------------
//
//        // send to twitter to do the authentication
//        router.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
//
//        // handle the callback after twitter has authorized the user
//        router.get('/connect/twitter/callback',
//            passport.authorize('twitter', {
//                successRedirect : '/profile',
//                failureRedirect : '/'
//            }));
//

    // google ---------------------------------

    // send to google to do the authentication
    router.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));

    // the callback after google has authorized the user
    router.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
//    router.get('/unlink/local', isLoggedIn, function(req, res) {
//        var user            = req.user;
//        user.local.email    = undefined;
//        user.local.password = undefined;
//        user.save(function(err) {
//            res.redirect('/profile');
//        });
//    });
//
//    // facebook -------------------------------
//    router.get('/unlink/facebook', isLoggedIn, function(req, res) {
//        var user            = req.user;
//        user.facebook.token = undefined;
//        user.save(function(err) {
//            res.redirect('/profile');
//        });
//    });
//
//    // twitter --------------------------------
//    router.get('/unlink/twitter', isLoggedIn, function(req, res) {
//        var user           = req.user;
//        user.twitter.token = undefined;
//        user.save(function(err) {
//            res.redirect('/profile');
//        });
//    });

    // google ---------------------------------
    router.get('/unlink/google', isLoggedIn, function (req, res) {
        const user = req.user;
        user.google.token = undefined;
        user.save(function (err) {
            res.redirect('/login');
        });
    });


};

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.cookies.token !== undefined && req.cookies.token !== 'undefined') {
            googleTools.storeCredentials(req, res);
        }
        return next();
    } else {
        res.redirect('/auth/google');
    }
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}


