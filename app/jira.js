const commons = require('../app/commons');

function create(req, callback) {
    const messages = [];
    messages.push("The following Jira tickets have been created: " + req.body.calendarEvents + "!");
    callback(messages);
}

module.exports = {
    create: function (req, callback) {
        create(req, callback);
    }
};