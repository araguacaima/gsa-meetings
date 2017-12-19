module.exports.timezone = 'UTC-06:00';
module.exports.dateFormatRFC3339 = 'YYYY-MM-DDTHH:mm:ssZ';
module.exports.showableDateFormat = 'ddd DD MMM YYYY';
module.exports.calendarListParams = {
    showHidden: true
};
module.exports.calendarEventsParams = {
    alwaysIncludeEmail: true,
    orderBy: 'startTime',
    showDeleted: false,
    showHiddenInvitations: true,
    showHidden: true,
    singleEvents: true,
    timeMin: '2017-11-27T00:00:00Z',
    timeMax: '2017-12-01T23:59:59Z',
    fields: 'items(creator(displayName,email),description,end(date,dateTime),hangoutLink,htmlLink,id,organizer(displayName,email),source,start(date,dateTime),status,summary),summary'
};