const settings = require('../config/settings');
const calendarIdList = settings.calendarIds;

const WEB_PATH = '/web';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'calendar-token.json';

let params = {
    alwaysIncludeEmail: true,
    orderBy: 'startTime',
    showDeleted: false,
    showHiddenInvitations: true,
    singleEvents: true,
    timeMin: '2017-11-27T00:00:00Z',
    timeMax: '2017-12-01T23:59:59Z',
    fields: 'items(creator(displayName,email),description,end(date,dateTime),hangoutLink,htmlLink,id,organizer(displayName,email),source,start(date,dateTime),status,summary),summary'
};

function getEventsFromAllCalendars(auth) {
    calendarIdList.map(function (value) {
        listEvents(auth, params, value);
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param params_
 * @param calendarId
 */
function listEvents(auth, params_, calendarId) {
    const calendar = google.calendar('v3');
    if (params_ === undefined) {
        params_ = params;
    }
    params_.auth = auth;
    params_.calendarId = calendarId;
    calendar.events.list(params, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        const events = response.items;
        if (events.length === 0) {
            console.log('No upcoming events found.');
        } else {
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                const start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });
}