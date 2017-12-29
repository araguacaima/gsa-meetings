const OAuth = require('oauth').OAuth;
const settings = require('../config/settings');
const auth = require('../config/auth').trelloAuth;
const HOME_DIR = require('os').homedir();
const TOKEN_DIR = HOME_DIR + '/.credentials';
const TOKEN_PATH = TOKEN_DIR + '/trello-token.json';
const fs = require('fs');
const User = require('../app/models/user');

function getOAuthClient() {
    return new OAuth(auth.request_token_uri, auth.access_token_uri, auth.key, auth.secret, "1.0A", auth.redirect_uri, "HMAC-SHA1")
}

function requestForCredentials() {
    return new Promise(function (resolve, reject) {
        getRequestToken(function (err, token, tokenSecret, results) {
            if (!err) {
                let tokens = {};
                tokens.token = token;
                tokens.secret = tokenSecret;
                storeTokens(tokens);
                tokens.isNew = true;
                resolve(tokens);
            } else {
                reject(err);
            }
        });
    });
}

function checkForCredentials() {
    try {
        return fs.existsSync(TOKEN_PATH);
    } catch (err) {
        console.log(err.message)
    }
}

function getCredentials(res) {
    return new Promise(function (resolve, reject) {
        try {
            let json = fs.readFileSync(TOKEN_PATH);
            if (json.length === 0) {
                return new Promise(function (resolve, reject) {
                    deleteCredentials(res.req.cookies.trelloUserId);
                    resolve();
                }).then(() => requestForCredentials().then((credentials) => resolve(credentials))).resolve();
            } else {
                resolve(JSON.parse(json));
            }
        } catch (ex) {
            if (ex.code === 'ENOENT') {
                requestForCredentials().then((credentials) => resolve(credentials));
            } else {
                reject(ex);
            }
        }
    })
}

function deleteCredentials(userId) {
    try {
        fs.unlinkSync(TOKEN_PATH);
    } catch (err) {
        console.log(err.message)
    }
    User.findOne({'trello.id': userId}, function (err, user) {
        if (!err) {
            user.google.token = undefined;
            user.google.reset = false;
            user.save(function (err) {
                if (err) {
                    throw new Error(err);
                }
            });
        } else {
            throw new Error(err);
        }
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} tokens The token to store to disk.
 * @param callback
 */
function storeTokens(tokens, callback) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    let tokens_ = JSON.stringify(tokens);
    fs.writeFile(TOKEN_PATH, tokens_);
    console.log('Token stored to ' + TOKEN_PATH);
    if (callback !== undefined) {
        callback(tokens_);
    } else {
        return tokens_;
    }
}

function authorize(res, token, redirect) {
    res.redirect(auth.authorize_uri + `?oauth_token=${token}&name=${settings.appName}&return_url=${redirect}`);
}

function getOAuthAccessToken(token, tokenSecret, verifier) {
    return new Promise(function (resolve, reject) {
        getOAuthClient().getOAuthAccessToken(token, tokenSecret, verifier, function (error, accessToken, accessTokenSecret, results) {
            if (!error) {
                resolve({
                    'reqTokenSecret': tokenSecret,
                    'accessToken': accessToken,
                    'accessTokenSecret': accessTokenSecret
                });
            } else {
                reject({'error': error});
            }
        });
    });
}

function getRequestToken(callback) {
    getOAuthClient().getOAuthRequestToken(callback);
}

function getAccessToken(query) {
    return new Promise(function (resolve, reject) {
        db.getCachedTokenByReqToken(query.oauth_token).then(function (result) {
            const token = query.oauth_token;
            const tokenSecret = result.reqTokenSecret;
            const verifier = query.oauth_verifier;
            getOAuthAccessToken(token, tokenSecret, verifier).then(function (result) {
                if (!result.error) {
                    resolve(result)
                } else {
                    reject(result);
                }
            });
        });

    });
}

module.exports = {
    "getOAuthClient": getOAuthClient,
    "getCredentials": getCredentials,
    "storeTokens": storeTokens,
    "authorize": authorize,
    "requestForCredentials": requestForCredentials,
    "checkForCredentials": checkForCredentials,
    "getAccessToken": getAccessToken,
    "getOAuthAccessToken": getOAuthAccessToken,
    "getRequestToken": getRequestToken
};
