const jiraTools = require('../app/jiraTools');
const auth = require('../config/auth').jiraAuth;
const commons = require('../app/commons');
const issuesGetAPIUri = "/rest/api/2/issue/${id}";
const issueCreateAPIUri = "/rest/api/2/issue";
const addWorklogAPIUri = "/rest/api/2/issue/${issueIdOrKey}/worklog";
const addWatchersAPIUri = "/rest/api/2/issue/${issueIdOrKey}/watchers";
const issuesSearchAPIUri = "/rest/api/2/search";
const usersSearchAPIUri = "/rest/api/2/user/picker";
const createmetaAPIUri = "/rest/api/2/issue/createmeta";
const assignAPIUri = "/rest/api/2/issue/${issueIdOrKey}/assignee";
const doTransitionsAPIUri = "/rest/api/2/issue/${issueIdOrKey}/transitions";
const myselfAPIUri = "/rest/api/2/myself";
const methodGet = "GET";
const methodPost = "POST";
const methodPut = "PUT";
const createmetaParams = {
    parameters: {
        expand: "projects.issuetypes.fields",
        projectKeys: "SA"
    },
    headers: {"Accept": "application/json", "Content-Type": "application/json"}
};
const myselfParams = {
    headers: {"Accept": "application/json", "Content-Type": "application/json"}
};

module.exports.createIssue = function (jiraUserId, issue) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + issueCreateAPIUri;
        let args = {
            data: issue,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };
        return jiraTools.invoke(credentials.token, methodPost, url, args);
    }).then((data) => {
        return data;
    });
};

module.exports.addWatchers = function (jiraUserId, issueKey, watchersNames) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + addWatchersAPIUri;
        const promises = [];
        const watchersNamesTokens = watchersNames.split(",");
        watchersNamesTokens.forEach(function (watcherName) {
            const worklog = {
                name: watcherName
            };
            let args = {
                data: worklog,
                path: {issueIdOrKey: issueKey},
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            };
            promises.push(jiraTools.invoke(credentials.token, methodPost, url, args));
        });
        return Promise.all(promises);
    }).then((data) => {
        return data;
    });
};

module.exports.addWorklog = function (jiraUserId, issueKey, timeSpentSeconds) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {

        try {
            timeSpentSeconds = timeSpentSeconds / 1
        } catch (ex) {
        }

        if (!commons.isNumber(timeSpentSeconds)) {
            return "";
        } else {
            const url = auth.base_url + addWorklogAPIUri;
            const worklog = {
                "timeSpentSeconds": timeSpentSeconds
            };
            let args = {
                data: worklog,
                path: {issueIdOrKey: issueKey},
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            };
            return jiraTools.invoke(credentials.token, methodPost, url, args);
        }
    }).then((data) => {
        return data;
    });
};

module.exports.getIssue = function (jiraUserId, issueKey) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + issuesGetAPIUri;
        let args = {
            data: {},
            path: {"id": issueKey},
            parameters: {},
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };
        return jiraTools.invoke(credentials.token, methodGet, url, args);
    }).then((data) => {
        return data;
    });
};


module.exports.issueSearch = function (jiraUserId, text) {
    let textTrimed = text.trim();
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + issuesSearchAPIUri;
        let jql = "text ~ '" + textTrimed + "'";
        let args = {
            parameters: {"jql": jql},
            headers: {
                "Accept": "application/json"
            }
        };
        return Promise.all([jiraTools.invoke(credentials.token, methodGet, url, args), credentials]);
    }).then(([data, credentials]) => {
        if (data.issues.length === 0) {
            const url = auth.base_url + issuesSearchAPIUri;
            let jql = "id = '" + textTrimed + "'";
            let args = {
                parameters: {"jql": jql},
                headers: {
                    "Accept": "application/json"
                }
            };
            return jiraTools.invoke(credentials.token, methodGet, url, args)
        } else {
            return data;
        }
    }).then((data) => {
        return data.issues.map(function (issue) {
            return {
                key: issue.key, summary: issue.fields.summary
            };
        });
    });
};

module.exports.assignUser = function (jiraUserId, issueKey, user) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + assignAPIUri;
        let args = {
            data: user,
            path: {"issueIdOrKey": issueKey},
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };
        return jiraTools.invoke(credentials.token, methodPut, url, args);
    }).then((data) => {
        return data;
    });
};


module.exports.doTransition = function (jiraUserId, issueKey, transition) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + doTransitionsAPIUri;
        let args = {
            data: transition,
            path: {"issueIdOrKey": issueKey},
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };
        return jiraTools.invoke(credentials.token, methodPost, url, args);
    }).then((data) => {
        return data;
    });
};

module.exports.userSearch = function (jiraUserId, text) {
    let userSearchText = text.trim();
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + usersSearchAPIUri;
        let args = {
            parameters: {"query": userSearchText, "showAvatar": true},
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-Type": "application/json;charset=UTF-8"
            }
        };
        return jiraTools.invoke(credentials.token, methodGet, url, args);
    }).then((data) => {
        return data.users;
    });
};

module.exports.getCreatemeta = function (jiraUserId) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + createmetaAPIUri;
        return jiraTools.invoke(credentials.token, methodGet, url, createmetaParams)
    }).then((data) => {
        return data.projects[0];
    });

};

module.exports.getMyself = function (jiraUserId) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + myselfAPIUri;
        return jiraTools.invoke(credentials.token, methodGet, url, myselfParams)
    }).then((data) => {
        return data;
    });
};

module.exports.createUsersCombo = function (users) {
    const result = [];
    users.forEach(function (user) {
        result.push({
            text: user.displayName + " (" + user.name + ")",
            value: user.key,
            selected: false,
            description: user.html,
            imageSrc: user.avatarUrl,
            imageHeight: 32,
            imageWidth: 32
        });
    });
    return result;
};

module.exports.createIssueTypesCombo = function (jiraMeta) {
    const result = [];
    jiraMeta.issuetypes.forEach(function (item) {
        result.push({
            text: item.name,
            value: item.id,
            selected: false,
            description: item.description,
            imageSrc: item.iconUrl,
            imageHeight: 16,
            imageWidth: 16
        });
    });
    return result;
};

module.exports.createPriorityCombo = function (jiraMeta) {
    const result = [];
    jiraMeta.issuetypes[0].fields.priority.allowedValues.forEach(function (item) {
        result.push({
            text: item.name,
            value: item.id,
            selected: false,
            imageSrc: item.iconUrl,
            imageHeight: 16,
            imageWidth: 16
        });
    });
    return result;
};

module.exports.createTransitionsCombo = function () {
    const result = [];
    result.push({
        value: "4",
        text: "Start Progress",
        imageSrc: "/images/start.png",
        imageHeight: 16,
        imageWidth: 16
    });
    result.push({
        value: "5",
        text: "Resolve Issue",
        imageSrc: "/images/check.png",
        imageHeight: 16,
        imageWidth: 16
    });
    result.push({
        value: "2",
        text: "Close Issue",
        imageSrc: "/images/close.png",
        imageHeight: 16,
        imageWidth: 16
    });
    result.push({
        value: "301",
        text: "Stop Progress",
        imageSrc: "/images/stop.png",
        imageHeight: 16,
        imageWidth: 16
    });
    return result;
};


module.exports.createWorklogCombo = function () {
    return [{
        value: 1,
        text: "1"
    }, {
        value: 2,
        text: "2"
    }, {
        value: 3,
        text: "3"
    }, {
        value: 4,
        text: "4"
    }, {
        value: 5,
        text: "5"
    }, {
        value: 6,
        text: "6"
    }, {
        value: 7,
        text: "7"
    }, {
        value: 8,
        text: "8"
    }];
};