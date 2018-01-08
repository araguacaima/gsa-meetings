module.exports.timezone = 'UTC-06:00';
module.exports.appName = 'GSA-Tools';
module.exports.dateFormatRFC3339 = 'YYYY-MM-DDTHH:mm:ssZ';
module.exports.showableDateFormat = 'ddd DD MMM YYYY';
module.exports.calendarListParams = {
    showHidden: true
};
module.exports.calendarEventsParams = {
    alwaysIncludeEmail: true,
    showDeleted: false,
    showHiddenInvitations: true,
    showHidden: true,
    singleEvents: false,
    fields: 'items(creator(displayName,email),description,end(date,dateTime),hangoutLink,htmlLink,id,organizer(displayName,email),created,source,start(date,dateTime),status,summary),summary'
};
module.exports.jira = {
    solutionArchitects: {
        project: {
            id: 10135,
            key: "SA"
        }
    }
};