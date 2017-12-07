const google = require('googleapis');
const googleTools = require('../app/googleTools');
const calendar = google.calendar('v3');
let calendarParams = require('../config/settings').calendarParams;

function getEventsFromAllCalendars(req, callback, errCallback) {
    const calendarIds = [];
    const oAuth2Client = googleTools.getOAuth2Client();
    googleTools.getCredentials(req,
        function (credentials) {
            oAuth2Client.credentials = credentials;
            calendarParams.auth = oAuth2Client;
            calendar.calendarList.list(calendarParams, function (err, calendars) {
                if (err) {
                    console.log(err.message);
                    errCallback(err);
                } else {
                    let calendarsItems = calendars.items.filter(function (item) {
                        return !/(calendar\.google\.com)/.test(item.id);
                    });
                    calendarsItems.forEach(calendar =>
                        calendarIds.push(calendar.id)
                    );
                    callback(calendarIds);
                }
            });
        },
        errCallback
    );
    return calendarIds;
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
    get: function (req, callback, errCallback) {
        getEventsFromAllCalendars(req, callback, errCallback);
    }
};