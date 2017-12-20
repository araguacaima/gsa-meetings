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

function getEventsFromCalendarId(calendarEventsParams) {
    return new Promise(function (resolve, reject) {
        calendar.events.list(calendarEventsParams, function (err, events) {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                resolve(events.items.filter(function (item) {
                    return item.status !== 'cancelled';
                }));
            }
        });
    });
}

function getEventsFromAllCalendars(req, callback, errCallback) {
    let events = [];
    const oAuth2Client = googleTools.getOAuth2Client();
    const calendarsIds = JSON.parse(req.query.calendarsIds);
    calendarEventsParams.timeMin = req.query.startDate;
    calendarEventsParams.timeMax = req.query.endDate;
    calendarEventsParams.timezone = timezone;
    googleTools.getCredentials(req,
        function (credentials) {
            oAuth2Client.credentials = credentials;
            calendarEventsParams.auth = oAuth2Client;
            const promises = [];
            calendarsIds.forEach(function (calendarId) {
                calendarEventsParams.calendarId = calendarId;
                promises.push(
                    getEventsFromCalendarId(calendarEventsParams).then(function (result) {
                        events = events.concat(result);
                    }).catch(function (err) {
                        errCallback(err);
                    }));
            });
            Promise.all(promises).then(() => {
                callback(events)
            });
        },
        errCallback
    );
}

module.exports = {
    get: function (req, callback, errCallback) {
        getAllCalendars(req, callback, errCallback);
    },
    getEvents: function (req, callback, errCallback) {
        getEventsFromAllCalendars(req, callback, errCallback);
    }
};