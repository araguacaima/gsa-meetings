const trelloTools = require('./trelloTools');
const uri = "https://api.trello.com";
const moment = require('moment');
const settings = require("../config/settings");

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

module.exports.getActions = function (cardInfoAndCredentials, res) {
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
        cardInfoAndCredentials.credentials = credentials;
        return new Promise(function (resolve, reject) {
            trelloTools.getOAuthClient().get(
                `${uri}/1/cards/${cardInfoAndCredentials.cardId}/actions?filter=commentCard,createCard,updateCard`,
                cardInfoAndCredentials.credentials.token,
                cardInfoAndCredentials.credentials.secret,
                function (err, data, response) {
                    if (!err) {
                        let result = {actions: JSON.parse(data)};
                        let actions = result.actions;
                        const actionsFiltered = actions.filter(function (action) {
                            //return action.type === "commentCard"
                            return true;
                        });
                        resolve(actionsFiltered);
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

module.exports.getCardsOnList = function (listInfoAndCredentials, res) {
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
        listInfoAndCredentials.credentials = credentials;
        return new Promise(function (resolve, reject) {
            trelloTools.getOAuthClient().get(
                /*api to gets cards in a given list, in a given board of a particular user: https://api.trello.com/1/lists/<listId>/cards */
                `${uri}/1/lists/${listInfoAndCredentials.listId}/cards`,
                listInfoAndCredentials.credentials.token,
                listInfoAndCredentials.credentials.secret,
                function (err, data, response) {
                    if (!err) {
                        let result = {cards: JSON.parse(data)};
                        if (listInfoAndCredentials.listName === 'Done') {
                            result.processSeveral = true;
                        } else if (listInfoAndCredentials.listName === 'Meetings') {
                            result.areMeetings = true;
                        }
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

module.exports.toJira = function (trelloInfo) {
    const created = trelloInfo.created;
    const lastActivity = trelloInfo.lastActivity;
    let dateLast = moment(lastActivity);
    let dateCreated = moment(created);
    let timeSpent = dateLast.diff(dateCreated, 'hours');
    timeSpent = timeSpent + "h";
    return {
/*        update: {
            worklog: [
                {
                    add: {
                        timeSpent: timeSpent,
                        started: dateCreated.format(settings.dateFormatRFC3339)
                    }
                }
            ]
        },*/
        fields: {
            project: {
                id: trelloInfo.project_id
            },
            summary: trelloInfo.card,
            issuetype: {
                id: trelloInfo.issue_type
            },
            /*            reporter: {
                            name: trelloInfo.user
                        },*/
            priority: {
                id: trelloInfo.priority
            },
            labels: trelloInfo.labels.split(","),
            description: trelloInfo.description,
            /*            "assignee": {
                            "name": "homer"
                        }*/
        }
    };
};