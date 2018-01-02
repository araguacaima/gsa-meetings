const jiraTools = require('../app/jiraTools');
const auth = require('../config/auth').jiraAuth;
const issuesAPIUri = "/rest/api/2/issue/{id}";
const createmetaAPIUri = "/rest/api/2/issue/createmeta";
const methodGet = "GET";

module.exports.createIssue = function(jiraUserId, callback) {
    const messages = [];
    callback(messages);
};

module.exports.getIssue = function(jiraUserId, callback, errCallback) {
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
    jiraTools.invoke(jiraUserId, methodGet, url, args,
        function (result) {
            messages.push("The following Jira tickets have been created: " + result + "!");
        },
        errCallback
    );
    callback(messages);
};


module.exports.getCreatemeta = function(jiraUserId) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId).then((credentials) => resolve(credentials)).catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + createmetaAPIUri;
        return new Promise(function (resolve, reject) {
            jiraTools.invoke(credentials.token, methodGet, url);
            return resolve();
        }).then(() => {
            console.log("pasó");
        });
    });
};
