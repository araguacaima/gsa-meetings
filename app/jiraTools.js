const RestClient = require('node-rest-client').Client;
const User = require('../app/models/user');
const restClient = new RestClient();

function invoke(req, method, url, args, callback, errCallback) {
    const jiraUserId = req.cookies.jiraUserId;
    User.findOne({'jira.id': jiraUserId}, function (err, user) {
        if (!err) {
            if (user.jira.token === undefined) {
                const error = {};
                error.message = "Absent credentials";
                errCallback(error);
            } else {
                args.headers.Autorization = "Basic " + user.jira.token;
                restClient.registerMethod("callback", url, method.toUpperCase());
                // registering remote methods
                restClient.methods.callback(args, function (data, response) {
                    // parsed response body as js object
                    console.log(data);
                    // raw response
                    console.log(response);
                });

            }
            callback(result);

        } else {
            errCallback(err);
        }
    });
}

module.exports = {
    "invoke": invoke
};
