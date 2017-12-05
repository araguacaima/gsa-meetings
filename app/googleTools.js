const googleAuth = require('google-auth-library');
const auth = require('../config/auth').googleAuth;
const clientSecret = auth.client_secret;
const clientId = auth.client_id;
const redirectUrl = auth.redirect_uris[1];
const HOME_DIR = require('os').homedir();
const TOKEN_DIR = HOME_DIR + '/.credentials';
const TOKEN_PATH = TOKEN_DIR + '/calendar-token.json';
const fs = require('fs');


function getOAuth2Client() {
    const auth_ = new googleAuth();
    return new auth_.OAuth2(clientId, clientSecret, redirectUrl);
}

function storeCredentials(req, res, callback) {
    const code = req.cookies.token;
    const oAuth2Client = this.getOAuth2Client();
    res.clearCookie("token");
    oAuth2Client.getToken(code, function (err, tokens) {
        if (!err) {
            storeTokens(tokens);
            if (callback !== undefined) {
                callback(tokens);
            }
        }
    });
}

function getCredentials(callback, errorCallback) {
    fs.readFile(TOKEN_PATH, function (err, credentials) {
        if (!err) {
            try {
                const tokens = JSON.parse(credentials);
                if (callback !== undefined) {
                    callback(tokens);
                }
            } catch (ex) {
                console.log(ex);
                callback();
            }
        } else {
            errorCallback();
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

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} auth The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(callback) {
    const clientSecret = auth.client_secret;
    const clientId = auth.client_id;
    const redirectUrl = auth.redirect_uris[1];
    const auth_ = new googleAuth();
    const oauth2Client = new auth_.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    oauth2Client.refreshAccessToken(function (err, tokens) {
        if (err) {
            console.log('Error while trying to refresh access token', err);
        } else {
            oauth2Client.credentials = tokens;
            storeToken(tokens);
            callback(oauth2Client);
        }
    });

    oauth2Client.getToken(code, function (err, token) {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
    });
}

module.exports = {
    "getOAuth2Client": getOAuth2Client,
    "storeCredentials": storeCredentials,
    "getCredentials": getCredentials,
    "storeTokens": storeTokens,
    "getNewToken": getNewToken,
    "authorize": authorize
};
