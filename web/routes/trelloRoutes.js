const db = new(require('./db')),
    trelloAuth = require('../../config/auth').trelloAuth,
    trello = new(require('../../app/trello')),
    appConfig = ('./appConfig');

module.exports.loginWithTrelloRequest = function (req, res) {
    var callback = function (error, token, tokenSecret, results) {
        if (!error) {
            trelloAuth.cacheRequestTokenSecretPair(token, tokenSecret).then(function (result) {
                res.send(`${trelloAuth.trelloAuthUrls.authorizeURL}?oauth_token=${token}&name=${appConfig.appName}`);
            });
        } else {
            //TODO: send login failure error message to be displayed to the user.
            res.send();
        }
    };

    trelloAuth.getRequestToken(callback);
};

module.exports.oauthCallbackUrl = function (req, res) {
    if (!isAccessDenied(req)) {
        trelloAuth.getAccessToken(url.parse(req.url, true).query).then(function (tokenResult) {
            if (!tokenResult.error) {
                trello.getUserInfo(tokenResult).then(function (userInfoResult) {
                    tokenResult.userId = JSON.parse(userInfoResult).id
                    var cacheTokenPromise = db.updateCachedToken(tokenResult);
                    var updateUserInfoPromise = db.updateUserInfo(userInfoResult);
                    Promise.all([cacheTokenPromise, updateUserInfoPromise]).then(function (allResult) {
                        console.log(allResult);
                        var err = _.find(allResult, function (item) {
                            return item.err !== undefined;
                        })
                        if (!err) {
                            var retunObj = {
                                accessToken: allResult[0].accToken,
                                username: allResult[1].username
                            }
                            //TODO: send returnObject as return data
                            res.writeHead(302, {
                                'Location': `/user/authorized/${retunObj.accessToken}`
                            });
                            res.end();
                        } else {
                            //TODO: include login unseccessful message as return object
                            res.writeHead(302, {
                                'Location': `/signin`
                            });
                            res.end();
                        }
                    });
                })
            } else {
                //TODO: redirect the user to login state with error message
                res.writeHead(302, {
                    'Location': `/signin`
                });
                res.end();
            }
        })
    } else {
        res.writeHead(302, {
            'Location': `/signin`
        });
        res.end();
    }
};

module.exports.getTrelloBoardsByUser = function (req, res) {
    db.getCachedTokenByAccessToken(req.body.accessToken).then(function (tokenInfo) {
        if (!tokenInfo.error) {
            trello.getUserTrelloBoards(tokenInfo).then(function (result) {
                if (!result.error) {
                    res.send(result);
                } else {
                    var error = {
                        errorStatus: true,
                        source: 'Trello board',
                        message: result.error.message.substring(1, 40)
                    };
                    res.send(error);
                }
            });
        } else {
            //TODO: handle error if no token info found
            res.send(tokenInfo.error);
        }

    });
};

module.exports.getTrelloBoardLists = function (req, res) {
    var boardListsPromise = new Promise(function (resolve, reject) {
        db.getCachedTokenByAccessToken(req.body.accessToken).then(function (tokenInfo) {
            if (!tokenInfo.error) {
                trello.getBoardLists({
                    'boardId': req.body.boardId,
                    'tokenInfo': tokenInfo
                }).then(function (result) {
                    if (!result.error) {
                        res.send(result);
                    } else {
                        var error = {
                            errorStatus: true,
                            source: 'Trello board list',
                            message: result.error.message.substring(1, 40)
                        };
                        res.send(error);
                    }
                });
            } else {
                //TODO: handle case where accessToken may have been tempered with at fron end.
                res.send(tokenInfo.error);
            }
        });
    });
};


module.exports.getCardsInList = function (req, res) {
    db.getCachedTokenByAccessToken(req.body.accessToken).then(function (tokenInfo) {
        if (!tokenInfo.error) {
            trello.getCardsOnList({
                'listId': req.body.listId,
                'tokenInfo': tokenInfo
            }).then(function (result) {
                if (!result.error) {
                    res.send(result)
                } else {
                    var error = {
                        errorStatus: true,
                        source: 'Trello card',
                        message: result.error.message.substring(1, 40)
                    };
                    res.send(error);
                }
            });
        } else {
            res.send(tokenInfo.error);
        }
    });
}


//end point to uncache token/key pair from memory when user indicates interest to sign out.
module.exports.removeCachedToken = function (req, res) {
    db.uncacheToken(req.body).then(function (result) {
        res.send(result);
    });
}