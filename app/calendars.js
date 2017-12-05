const google = require('googleapis');
const googleTools = require('../app/googleTools');
const googleTools = require('../app/googleTools');
const calendar = google.calendar('v3');
let calendarParams = require('../config/settings').calendarParams;

function getEventsFromAllCalendars(auth) {
    const oAuth2Client = googleTools.getOAuth2Client();
    googleTools.getCredentials(
        function (credentials) {
            oAuth2Client.credentials = credentials;
            calendarParams.auth = oAuth2Client;
            calendar.calendarList.list(calendarParams, function (calendars, err) {
                if (!err) {
                    console.log(err.message);
                } else {
                    calendars.forEach(value =>
                        listEvents(auth, calendarParams, value)
                    );
                }
            });
        }
    );
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param params_
 * @param calendarId
 */
function listEvents(auth, params_, calendarId) {

    if (params_ === undefined) {
        params_ = calendarParams;
    }
    params_.auth = auth;
    params_.calendarId = calendarId;
    calendar.events.list(calendarParams, function (err, response) {
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

module.exports = {
    get: function (auth) {
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        if (!auth) {
            googleTools.authorize(getEventsFromAllCalendars);
        } else {
            getEventsFromAllCalendars(auth)
        }
    }
};