// load all the things we need
// var LocalStrategy    = require('passport-local').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
// var TwitterStrategy  = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const User = require('../app/models/user');
const googleTools = require('../app/googleTools');
const jiraTools = require('../app/jiraTools');

// load the auth variables
const configAuth = require('./auth'); // use this one for testing

module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID: configAuth.googleAuth.client_id,
            clientSecret: configAuth.googleAuth.client_secret,
            callbackURL: configAuth.googleAuth.redirect_uris[1],
            passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
            store: configAuth.commons.store
        },
        function (req, token, refreshToken, profile, done) {

            req.cookies.userId = profile.id;
            req.res.cookie('userId', profile.id);

            // asynchronous
            process.nextTick(function () {

                let tokens = {};
                tokens.access_token = token;
                tokens.refresh_token = refreshToken;
                googleTools.storeTokens(tokens, function () {

                    // check if the user is already logged in
                    if (!req.user) {

                        User.findOne({'google.id': profile.id}, function (err, user) {
                            if (err)
                                return done(err);

                            let email = (profile.emails[0].value || '').toLowerCase();
                            user.jira.id = email.split("@")[0];
                            req.cookies.jiraUserId = user.jira.id;
                            req.res.cookie('jiraUserId', user.jira.id);
                            let jiraTokens = {};
                            jiraTokens.id = user.jira.id;
                            jiraTokens.token = user.jira.token;
                            if (jiraTokens.token !== undefined) {
                                jiraTools.storeTokens(jiraTokens);
                            }
                            if (req.cookies.google_auth_renew_token || user.google.reset) {
                                googleTools.requestForCredentials(req, function (tokens) {

                                    let email = (profile.emails[0].value || '').toLowerCase();
                                    if (user) {

                                        // if there is a user id already but no token (user was linked at one point and then removed)
                                        if (!user.google.token) {
                                            user.google.token = tokens.token;
                                            user.google.name = profile.displayName;
                                            user.google.email = email; // pull the first email
                                            user.jira.id = email.split("@")[0];
                                            req.cookies.jiraUserId = user.jira.id;
                                            req.res.cookie('jiraUserId', user.jira.id);

                                            user.trello.id = email.split("@")[0];
                                            req.cookies.trelloUserId = user.trello.id;
                                            req.res.cookie('trelloUserId', user.trello.id);

                                            user.save(function (err) {
                                                if (err) {
                                                    return done(err);
                                                }
                                                // req.res.clearCookie("google_auth_renew_token");
                                                // req.res.clearCookie("google_auth_code");
                                                return done(null, user);
                                            });
                                        }

                                        return done(null, user);
                                    } else {
                                        const newUser = new User();
                                        newUser.google = {};
                                        newUser.google.id = profile.id;
                                        newUser.google.token = tokens.token;
                                        newUser.google.name = profile.displayName;
                                        newUser.google.email = email; // pull the first email
                                        newUser.jira = {};
                                        newUser.jira.id = email.split("@")[0];
                                        req.cookies.jiraUserId = newUser.jira.id;
                                        req.res.cookie('jiraUserId', newUser.jira.id);
                                        newUser.trello = {};
                                        newUser.trello.id = email.split("@")[0];
                                        req.cookies.trelloUserId = newUser.trello.id;
                                        req.res.cookie('trelloUserId', newUser.trello.id);

                                        newUser.save(function (err) {
                                            if (err) {
                                                return done(err);
                                            }
                                            req.res.clearCookie("google_auth_renew_token");
                                            req.res.clearCookie("google_auth_code");
                                            return done(null, newUser);
                                        });
                                    }
                                }, function () {
                                    return done(null, user);
                                })
                            } else {
                                let email = (profile.emails[0].value || '').toLowerCase();
                                if (user) {

                                    // if there is a user id already but no token (user was linked at one point and then removed)
                                    if (!user.google.token) {
                                        user.google.token = token;
                                        user.google.name = profile.displayName;
                                        user.google.email = email; // pull the first email
                                        user.jira.id = email.split("@")[0];
                                        req.cookies.jiraUserId = user.jira.id;
                                        req.res.cookie('jiraUserId', user.jira.id);

                                        user.trello.id = email.split("@")[0];
                                        req.cookies.trelloUserId = user.trello.id;
                                        req.res.cookie('trelloUserId', user.trello.id);

                                        user.save(function (err) {
                                            if (err)
                                                return done(err);

                                            return done(null, user);
                                        });
                                        googleTools.storeTokens(tokens);
                                    }

                                    return done(null, user);
                                } else {
                                    const newUser = new User();
                                    newUser.google = {};
                                    newUser.google.id = profile.id;
                                    newUser.google.token = token;
                                    newUser.google.name = profile.displayName;
                                    newUser.google.email = email; // pull the first email
                                    newUser.jira = {};
                                    newUser.jira.id = email.split("@")[0];
                                    req.cookies.jiraUserId = newUser.jira.id;
                                    req.res.cookie('jiraUserId', newUser.jira.id);
                                    newUser.trello = {};
                                    newUser.trello.id = email.split("@")[0];
                                    req.cookies.trelloUserId = newUser.trello.id;
                                    req.res.cookie('trelloUserId', newUser.trello.id);

                                    newUser.save(function (err) {
                                        if (err)
                                            return done(err);

                                        return done(null, newUser);
                                    });
                                }
                            }
                        });

                    } else {
                        // user already exists and is logged in, we have to link accounts
                        let user = req.user; // pull the user out of the session

                        user.google.id = profile.id;
                        user.google.name = profile.displayName;
                        let email = (profile.emails[0].value || '').toLowerCase();
                        user.google.email = email; // pull the first email
                        user.jira.id = email.split("@")[0];
                        req.cookies.jiraUserId = user.jira.id;
                        req.res.cookie('jiraUserId', user.jira.id);

                        user.trello.id = email.split("@")[0];
                        req.cookies.trelloUserId = user.trello.id;
                        req.res.cookie('trelloUserId', user.trello.id);

                        if (req.cookies.google_auth_renew_token) {
                            googleTools.requestForCredentials(req, function (tokens) {
                                user.google.token = tokens.token;
                                user.save(function (err) {
                                    if (err) {
                                        return done(err);
                                    }
                                    req.res.clearCookie("google_auth_renew_token");
                                    req.res.clearCookie("google_auth_code");
                                    return done(null, user);
                                });
                            }, function () {
                                return done(null, user);
                            })
                        } else {
                            user.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, user);
                            });
                        }
                    }
                });
            });
        }));
};

