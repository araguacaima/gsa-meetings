const jira = require('./jira');
const trelloTools = require('./trelloTools');
const uri = "https://api.trello.com";


module.exports.getUserInfo = function (tokenkeyPair) {
    return new Promise(function (resolve, reject) {
        trelloTools.getOAuthClient().get(
            /* api to get a user's info: https://api.trello.com/1/members/me */
            `${uri}/1/members/me`,
            tokenkeyPair.accessToken,
            tokenkeyPair.accessTokenSecret,
            function (error, data, response) {
                if (!error) {
                    resolve(data);
                } else {
                    reject(error);
                }
            });
    });
};

module.exports.getUserTrelloBoards = function (res) {
    return new Promise(function (resolve, reject) {
        trelloTools.getCredentials(res).then((credentials) => {
            if (credentials.isNew) {
                res.req.session.redirectUrl = res.req.url;
                trelloTools.authorize(res, credentials.token, '/trello')
            } else {
                resolve(credentials, res.req.cookies.trelloUserId);
            }
        });
    }).then(function (credentials, userId) {
        return new Promise(function (resolve, reject) {
            trelloTools.getOAuthClient().get(
                `${uri}/1/members/me/boards`,
                credentials.token,
                credentials.secret,
                function (err, data, response) {
                    if (!err) {
                        resolve({boards: JSON.parse(data)});
                    } else {
                        if (err && data === 'invalid token') {
                            err.renewTokens = {};
                            err.renewTokens.trello = true;
                            trelloTools.deleteCredentials(userId);
                        }
                        reject(err);
                    }
                })
        })
    });
};

module.exports.getBoardLists = function (boardIdAndCredentials, res) {
    return new Promise(function (resolve, reject) {
        trelloTools.getCredentials(res).then((credentials) => {
            if (credentials.isNew) {
                res.req.session.redirectUrl = res.req.url;
                trelloTools.authorize(res, credentials.token, '/trello/lists')
            } else {
                resolve(credentials, res.req.cookies.trelloUserId);
            }
        });
    }).then(function (credentials, userId) {
        boardIdAndCredentials.credentials = credentials;
        return new Promise(function (resolve, reject) {
            trelloTools.getOAuthClient().get(
                /*api to gets lists in a given board of a particular user:
                https://api.trello.com/1/boards/<boardId>/lists */
                `${uri}/1/boards/${boardIdAndCredentials.boardId}/lists`,
                boardIdAndCredentials.credentials.token,
                boardIdAndCredentials.credentials.secret,
                function (err, data, response) {
                    if (!err) {
                        resolve({lists: JSON.parse(data)});
                    } else {
                        if (err && data === 'invalid token') {
                            err.renewTokens = {};
                            err.renewTokens.trello = true;
                            trelloTools.deleteCredentials(userId);
                        }
                        reject(err);
                    }
                }
            );
        })
    });
};

module.exports.getCardsOnList = function (listIsAndCredentials, res) {
    return new Promise(function (resolve, reject) {
        trelloTools.getCredentials(res).then((credentials) => {
            if (credentials.isNew) {
                res.req.session.redirectUrl = res.req.url;
                trelloTools.authorize(res, credentials.token, '/trello/lists')
            } else {
                resolve(credentials, res.req.cookies.trelloUserId);
            }
        });
    }).then(function (credentials, userId) {
        listIsAndCredentials.credentials = credentials;
        return new Promise(function (resolve, reject) {
            trelloTools.getOAuthClient().get(
                /*api to gets cards in a given list, in a given board of a particular user: https://api.trello.com/1/lists/<listId>/cards */
                `${uri}/1/lists/${listIsAndCredentials.listId}/cards`,
                listIsAndCredentials.credentials.token,
                listIsAndCredentials.credentials.secret,
                function (err, data, response) {
                    if (!err) {
                        let result = {cards: JSON.parse(data)};
                        if (listIsAndCredentials.listName === 'Done') {
                            result.processSeveral = true;
                        } else if (listIsAndCredentials.listName === 'Meetings') {
                            result.areMeetings = true;
                        }
                        resolve.jiraMeta=jira.getCreatemeta();
                        resolve(result);
                    } else {
                        if (err && data === 'invalid token') {
                            err.renewTokens = {};
                            err.renewTokens.trello = true;
                            trelloTools.deleteCredentials(userId);
                        }
                        reject(err);
                    }
                }
            );
        })
    });
};