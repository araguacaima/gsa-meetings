const RestClient = require('node-rest-client').Client;
const User = require('../app/models/user');
const restClient = new RestClient();
const HOME_DIR = require('os').homedir();
const TOKEN_DIR = HOME_DIR + '/.credentials';
const TOKEN_PATH = TOKEN_DIR + '/jira-token.json';
const fs = require('fs');

function invoke(token, method, url, args) {

    return new Promise(function (resolve, reject) {
        if (args === undefined) {
            args = {};
            args.headers = {};
        }
        args.headers.Authorization = "Basic " + token;
        restClient.registerMethod("callback", url, method.toUpperCase());
        // registering remote methods
        restClient.methods.callback(args, function (data, response) {
            // parsed response body as js object
            resolve(data);
        });
    }).then((data) => {
        return data;
    });
}


function deleteCredentials(userId) {
    try {
        fs.unlinkSync(TOKEN_PATH);
    } catch (err) {
        console.log(err.message)
    }
    User.findOne({'jira.id': userId}, function (err, user) {
        if (!err) {
            user.trello.token = undefined;
            user.trello.reset = false;
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

function getCredentials(jiraUserId) {
    return new Promise(function (resolve, reject) {
        try {
            let json = fs.readFileSync(TOKEN_PATH);
            if (json.length === 0) {
                return new Promise(function (resolve, reject) {
                    deleteCredentials(jiraUserId);
                    reject();
                });
            } else {
                resolve(JSON.parse(json));
            }
        } catch (ex) {
            reject(ex);
        }
    })
}

module.exports = {
    "storeTokens": storeTokens,
    "invoke": invoke,
    "getCredentials": getCredentials,
};
