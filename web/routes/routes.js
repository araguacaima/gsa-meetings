const auth = require('../../config/auth').googleAuth;
const calendars = require('../../app/calendars');
const trello = require('../../app/trello');
const jira = require('../../app/jira');
const googleTools = require('../../app/googleTools');
const trelloTools = require('../../app/trelloTools');
const dateFormatRFC3339 = require('../../config/settings').dateFormatRFC3339;
const timezone = require('../../config/settings').timezone;
const showableDateFormat = require('../../config/settings').showableDateFormat;
const jiraControllers = require('../controllers/jiraControllers');
const base64 = require('base-64');
const url = require('url');
const User = require('../../app/models/user');

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
        calendars.getEvents(req, function (calendarEvents) {
            res.render('calendars-details', {
                title: 'GSA | Calendars Details',
                calendarEvents: calendarEvents,
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
    router.get('/trello', ensureAuthenticated, function (req, res) {
        trello.getUserTrelloBoards(res).then(function (result) {
            if (!result.error) {
                res.render('trello', {
                    title: 'GSA | Trello',
                    boards: result.boards,
                    authorised: req.isAuthenticated()
                });
            } else {
                res.redirect('/login/trello');
            }
        }).catch((err) => {
            if (err && err.renewTokens.trello) {
                res.redirect('/trello')
            } else {
                res.redirect('/login/trello')
            }
        })
    });

    // show the home page (will also have our login links)
    router.get('/trello/lists', ensureAuthenticated, function (req, res) {
        let boardIdAndCredentials = {};
        boardIdAndCredentials.boardId = req.query.boardId;
        trello.getBoardLists(boardIdAndCredentials, res).then(function (result) {
            if (!result.error) {
                res.render('trello-lists', {
                    title: 'GSA | Trello Lists',
                    lists: result.lists,
                    authorised: req.isAuthenticated()
                });
            } else {
                res.redirect('/login/trello');
            }
        }).catch((err) => {
            if (err && err.renewTokens.trello) {
                res.redirect('/trello')
            } else {
                res.redirect('/login/trello')
            }
        })
    });

    // show the home page (will also have our login links)
    router.get('/trello/lists/cards', ensureAuthenticated, function (req, res) {
        let listInfoAndCredentials = {};
        listInfoAndCredentials.listId = req.query.listId;
        listInfoAndCredentials.listName = req.query.listName;
        trello.getCardsOnList(listInfoAndCredentials, res).then(function (result) {
            if (!result.error) {
                res.render('trello-cards', {
                    title: 'GSA | Trello Cards',
                    cards: result.cards,
                    processSeveral: result.processSeveral,
                    areMeetings: result.areMeetings,
                    authorised: req.isAuthenticated()
                });
            } else {
                res.redirect('/login/trello');
            }
        }).catch((err) => {
            if (err && err.renewTokens.trello) {
                res.redirect('/trello')
            } else {
                res.redirect('/login/trello')
            }
        })
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

    router.post('/jira/ticket', ensureAuthenticated, jiraControllers.createTicket, function (req, res) {
        jira.getIssue(req, function (messages) {
            res.render('index', {
                title: 'GSA Tools',
                config: auth,
                authorised: req.isAuthenticated(),
                messages: messages
            });
        }, res.redirect('/login/jira'));
    });


    router.get('/login/jira',
        function (req, res) {
            res.render('login-jira', {
                title: 'GSA | Jira Authentication'
            })
        });

    router.get('/login/trello',
        function (req, res) {
            res.render('login-trello', {
                title: 'GSA | Trello Authentication'
            })
        });

    router.post('/login/jira',
        function (req, res) {
            console.log(req.body);
            const jiraToken = base64.encode(req.body.username + ":" + req.body.password);
            const jiraUserId = req.cookies.jiraUserId;
            User.findOne({'jira.id': jiraUserId}, function (err, user) {
                user.jira.token = jiraToken;
                user.save(
                    function (err) {
                        if (!err) {
                            res.render('index', {
                                title: 'GSA Tools',
                                config: auth,
                                authorised: req.isAuthenticated()
                            });
                        } else {
                            res.redirect('/login/jira');
                        }
                    }
                );
            });
        });

    router.post('/login/trello',
        function (req, res) {
            console.log(req.body);
            const jiraToken = base64.encode(req.body.username + ":" + req.body.password);
            const jiraUserId = req.cookies.jiraUserId;
            User.findOne({'jira.id': jiraUserId}, function (err, user) {
                user.jira.token = jiraToken;
                user.save(
                    function (err) {
                        if (!err) {
                            res.render('index', {
                                title: 'GSA Tools',
                                config: auth,
                                authorised: req.isAuthenticated()
                            });
                        } else {
                            res.redirect('/login/trello');
                        }
                    }
                );
            });
        });

    // the callback after trello has authenticated the user
    router.get('/auth/trello/callback',
        function (req, res) {
            const query = url.parse(req.url, true).query;
            const token = query.oauth_token;
            const verifier = query.oauth_verifier;
            const oAuthClient = trelloTools.getOAuthClient();
            trelloTools.getCredentials().then(
                (credentials) => {
                    new Promise(function (resolve, reject) {
                        oAuthClient.getOAuthAccessToken(token, credentials.secret, verifier, function (error, accessToken, accessTokenSecret, results) {
                            // In a real app, the accessToken and accessTokenSecret should be stored
                            console.log(`in getOAuthAccessToken - accessToken: ${accessToken}, accessTokenSecret: ${accessTokenSecret}, error: ${error}`);
                            let tokens = {};
                            tokens.token = accessToken;
                            tokens.secret = accessTokenSecret;
                            trelloTools.storeTokens(tokens);
                            resolve();
                        });
                    }).then(() => res.redirect(req.session.redirectUrl))
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

