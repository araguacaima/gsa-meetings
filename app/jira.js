const jiraTools = require('../app/jiraTools');
const auth = require('../config/auth').jiraAuth;
const issuesAPIUri = "/rest/api/2/issue/{id}";
const methodGet = "GET";

function createIssue(req, callback) {
    const messages = [];

    let args = {
        data: {test: "hello"}, // data passed to REST method (only useful in POST, PUT or PATCH methods)
        path: {"id": 120}, // path substitution var
        parameters: {arg1: "hello", arg2: "world"}, // this is serialized as URL parameters
        headers: {"test-header": "client-api"} // request headers
    };

    jiraTools.invoke(req,
        function (error, oauthToken, oauthTokenSecret) {
            if (error) {
                console.log(error.data);
                messages.push("Error getting OAuth access token");
            } else {
                req.session.oa = oa;
                req.session.oauth_token = oauthToken;
                req.session.oauth_token_secret = oauthTokenSecret;
                jiraTools.authorize(function (url) {
                    return req.res.redirect(url);
                });
            }
            messages.push("The following Jira tickets have been created: " + req.body.calendarEvents + "!");
        },
        function (error) {
            if (error) {
                console.log(error.data);
                messages.push("Error getting OAuth access token");
            }
        }
    );
    callback(messages);
}

function getIssue(req, callback, errCallback) {
    const messages = [];
    let args = {
        data: {},
        path: {"id": "TVP-7409"},
        parameters: {},
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };
    const url = auth.base_url + issuesAPIUri;
    jiraTools.invoke(req, methodGet, url, args,
        function (result) {
            messages.push("The following Jira tickets have been created: " + result + "!");
        },
        errCallback
    );
    callback(messages);
}

module.exports = {
    createIssue: function (req, callback) {
        createIssue(req, callback);
    },
    getIssue: function (req, callback, errCallback) {
        getIssue(req, callback, errCallback);
    }
};