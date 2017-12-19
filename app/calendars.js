const google = require('googleapis');
const googleTools = require('../app/googleTools');
const calendar = google.calendar('v3');
let calendarListParams = require('../config/settings').calendarListParams;
let calendarEventsParams = require('../config/settings').calendarEventsParams;
const timezone = require('../config/settings').timezone;

function getAllCalendars(req, callback, errCallback) {
    const calendarIds = [];
    const oAuth2Client = googleTools.getOAuth2Client();
    googleTools.getCredentials(req,
        function (credentials) {
            oAuth2Client.credentials = credentials;
            calendarListParams.auth = oAuth2Client;
            calendar.calendarList.list(calendarListParams, function (err, calendars) {
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


function getEventsFromAllCalendars(req, callback, errCallback) {
    const calendarEvents = [];
    const oAuth2Client = googleTools.getOAuth2Client();
    googleTools.getCredentials(req,
        function (credentials) {
            oAuth2Client.credentials = credentials;
            calendarEventsParams.auth = oAuth2Client;
            calendarEventsParams.timeMin = req.query.startDate;
            calendarEventsParams.timeMax = req.query.endDate;
            calendarEventsParams.timezone = timezone;
            const calendarsIds = JSON.parse(req.query.calendarsIds);
            calendarsIds.each(function (calendarId) {
              calendarEventsParams.calendarId = calendarId;
              calendar.events.list(calendarEventsParams, function (err, events) {
                if (err) {
                  console.log(err.message);
                  errCallback(err);
                } else {
                  let calendarsItems = events.filter(function (item) {
                    return !/(calendar\.google\.com)/.test(item.id);
                  });
                  calendarsItems.forEach(calendar =>
                    calendarEvents.push(calendar.id)
                  );
                  callback(calendarEvents);
                }
              });
            })
        },
        errCallback
    );
    return calendarEvents;
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
        params_ = calendarListParams;
    }
    params_.auth = auth;
    params_.calendarId = calendarId;
    calendar.events.list(calendarListParams, function (err, response) {
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
        getAllCalendars(req, callback, errCallback);
    },
    getEvents: function (req, callback, errCallback) {
        getEventsFromAllCalendars(req, callback, errCallback);
    }
};