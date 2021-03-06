const googleAuth = require('../../config/auth').googleAuth;
const jiraAuth = require('../../config/auth').jiraAuth;
const settings = require('../../config/settings');
const calendars = require('../../app/calendars');
const trello = require('../../app/trello');
const jira = require('../../app/jira');
const googleTools = require('../../app/googleTools');
const trelloTools = require('../../app/trelloTools');
const jiraTools = require('../../app/jiraTools');
const dateFormatRFC3339 = require('../../config/settings').dateFormatRFC3339;
const timezone = require('../../config/settings').timezone;
const showableDateFormat = require('../../config/settings').showableDateFormat;
const jiraControllers = require('../controllers/jiraControllers');
const base64 = require('base-64');
const url = require('url');
const User = require('../../app/models/user');
const commons = require('../../app/commons');

module.exports = function (router, passport) {

    // show the home page (will also have our login links)
    router.get('/', ensureAuthenticated, function (req, res) {
        res.render('index', {
            title: 'GSA Tools',
            config: googleAuth,
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
    router.get('/trello/boards/:boardId/lists', ensureAuthenticated, function (req, res) {
        let boardIdAndCredentials = {};
        boardIdAndCredentials.boardId = req.params.boardId;
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
    router.get('/trello/lists/:listId/cards', ensureAuthenticated, function (req, res) {
        let listInfoAndCredentials = {};
        let listName = req.query.listName;
        listInfoAndCredentials.listId = req.params.listId;
        listInfoAndCredentials.listName = listName;
        listInfoAndCredentials.delegated = listName.toUpperCase() === "DELEGATED";
        jira.getCreatemeta(req.cookies.jiraUserId).then((jiraMeta) => {
            jira.getMyself(req.cookies.jiraUserId).then((user) => {
                    const issueTypesCombo = jira.createIssueTypesCombo(jiraMeta);
                    const priorityCombo = jira.createPriorityCombo(jiraMeta);
                    const transitionsCombo = jira.createTransitionsCombo();
                    const worklogCombo = jira.createWorklogCombo();
                    trello.getCardsOnList(listInfoAndCredentials, res).then(function (result) {
                        if (!result.error) {
                            let cards = result.cards;
                            const promises = [];
                            cards.forEach(function (card) {
                                let cardInfoAndCredentials = {};
                                cardInfoAndCredentials.cardId = card.id;
                                promises.push(trello.getActions(cardInfoAndCredentials, res).then((actions) => card.actions = actions));
                            });
                            Promise.all(promises).then(function (resolve, reject) {
                                const cardsStr = JSON.stringify(cards, commons.escapeJson);
                                res.render('trello-cards', {
                                    title: 'GSA | Trello Cards',
                                    cards: JSON.parse(cardsStr),
                                    processSeveral: result.processSeveral,
                                    areMeetings: result.areMeetings,
                                    authorised: req.isAuthenticated(),
                                    jiraMeta: jiraMeta,
                                    issueTypesCombo: issueTypesCombo,
                                    transitionsCombo: transitionsCombo,
                                    worklogCombo: worklogCombo,
                                    priorityCombo: priorityCombo,
                                    jiraProject: settings.jira.solutionArchitects.project,
                                    userName: user.name,
                                    delegated: listInfoAndCredentials.delegated
                                });
                            });
                        } else {
                            res.redirect('/login/trello');
                        }
                    })
                }
            )
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
            config: googleAuth,
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
                scope: ['profile', 'email'].concat(googleAuth.scopes),
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

    router.post('/jira/trello/tickets', ensureAuthenticated, /*jiraControllers.createTicket, */function (req, res) {
        let trelloInfo = req.body;
        const issue = trello.toJira(trelloInfo);
        const prevUri = req.headers.referer;
        jira.createIssue(req.cookies.jiraUserId, issue).then((jiraIssue) => {
            return Promise.all([jira.getMyself(req.cookies.jiraUserId), jiraIssue]);
        }).then(([myself, jiraIssue]) => {
            return Promise.all([jira.assignUser(req.cookies.jiraUserId, jiraIssue.key, {name: myself.name}), jiraIssue]);
        }).then(([myself, jiraIssue]) => {
            return Promise.all([jira.addWatchers(req.cookies.jiraUserId, jiraIssue.key, trelloInfo.watchers), jiraIssue]);
        }).then(([myself, jiraIssue]) => {
            return Promise.all([jira.addWorklog(req.cookies.jiraUserId, jiraIssue.key, trelloInfo.worklog * 3600), jiraIssue]);
        }).then(([data, jiraIssue]) => {
            const jiraIssueKey = jiraIssue.key;
            if (data.errors === undefined && data.errorMessages === undefined) {
                const transition = {fields: {}};
                if (trelloInfo.status && trelloInfo.status !== null && trelloInfo.status !== undefined && trelloInfo.status !== "") {
                    transition.transition = {
                        id: trelloInfo.status
                    };
                }
                if (transition.transition) {
                    return Promise.all([jira.doTransition(req.cookies.jiraUserId, jiraIssueKey, transition), jiraIssue]);
                } else {
                    return Promise.all([null, jiraIssue]);
                }
            } else {
                throw new Error(data.errors);
            }
        }).then(([data, jiraIssue]) => {
            if (trelloInfo.assignTo && trelloInfo.assignTo !== null && trelloInfo.assignTo !== undefined && trelloInfo.assignTo !== "") {
                return Promise.all([jira.assignUser(req.cookies.jiraUserId, jiraIssue.key, {name: trelloInfo.assignTo}), jiraIssue]);
            } else {
                return Promise.all([null, jiraIssue]);
            }
        }).then(([data, jiraIssue]) => {
            if (data === undefined || data.errors === undefined) {
                let cardStickerInfoAndCredentials = {};
                cardStickerInfoAndCredentials.stickerId = settings.trello.migratedSticker.id;
                cardStickerInfoAndCredentials.cardId = trelloInfo.cardId;
                return Promise.all([trello.addSticker(cardStickerInfoAndCredentials, res), jiraIssue]);
            } else {
                throw new Error(data.errors);
            }
        }).then(([data, jiraIssue]) => {
            let cardCommentInfoAndCredentials = {};
            cardCommentInfoAndCredentials.cardId = trelloInfo.cardId;
            cardCommentInfoAndCredentials.comment = "Migrado a: " + jiraAuth.base_url + "/browse/" + jiraIssue.key;
            return trello.addComment(cardCommentInfoAndCredentials, res);
        }).then((data) => {
            if (data.errors === undefined) {
                res.redirect(prevUri);
            } else {
                res.redirect(res.redirect(prevUri + "?messages=" + data.errors))
            }
        }).catch((ex) => res.redirect(prevUri + "?messages=" + ex));
    });

    router.get('/jira/tickets', ensureAuthenticated, function (req, res) {
        jira.issueSearch(req.cookies.jiraUserId, req.query.q, req.query.full)
            .then((issues) => res.send(issues))
            .catch((err) => {
                console.log(err);
                res.send({})
            });
    });

    router.get('/jira/users', ensureAuthenticated, function (req, res) {
        jira.userSearch(req.cookies.jiraUserId, req.query.q)
            .then((users) => res.send(users))
            .catch((err) => {
                console.log(err);
                res.send({})
            });
    });


    router.get('/jira/users/combo', ensureAuthenticated, function (req, res) {
        jira.userSearch(req.cookies.jiraUserId, req.query.q)
            .then((users) => res.send(jira.createUsersCombo(users)))
            .catch((err) => {
                console.log(err);
                res.send({})
            });
    });

    router.get('/login/jira',
        function (req, res) {
            res.render('login-jira', {
                title: 'GSA | Jira Authentication'
            })
        });

    router.get('/jira',
        function (req, res) {
            res.render('jira', {
                title: 'GSA | Jira Quality'
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
                let tokens = {};
                tokens.id = jiraUserId;
                tokens.token = jiraToken;
                jiraTools.storeTokens(tokens);
                user.save(
                    function (err) {
                        if (!err) {
                            res.render('index', {
                                title: 'GSA Tools',
                                config: googleAuth,
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
                                config: googleAuth,
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

