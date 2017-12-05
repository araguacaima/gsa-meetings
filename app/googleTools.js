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

function getCredentials(callback) {
    if (callback !== undefined) {
        fs.readFile(TOKEN_PATH, function (err, token) {
            callback(JSON.parse(!err ? token : ''));
        });
    }
}

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

module.exports = {
    "getOAuth2Client": getOAuth2Client,
    "storeCredentials": storeCredentials,
    "getCredentials": getCredentials,
    "storeTokens": storeTokens
};
