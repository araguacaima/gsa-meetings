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
    const calendarsIds = JSON.parse(req.query.calendarsIds);
    calendarEventsParams.timeMin = req.query.startDate;
    calendarEventsParams.timeMax = req.query.endDate;
    calendarEventsParams.timezone = timezone;
    calendarsIds.forEach(function (calendarId) {
      googleTools.getCredentials(req,
        function (credentials) {
          oAuth2Client.credentials = credentials;
          calendarEventsParams.auth = oAuth2Client;
          calendarEventsParams.calendarId = calendarId;
          calendar.events.list(calendarEventsParams, function (err, events) {
            if (err) {
              console.log(err.message);
              errCallback(err);
            } else {
              let calendarsItems = events.items.filter(function (item) {
                return item.status !== 'cancelled';
              });
              calendarEvents.concat(calendarsItems);
            }
          });
          callback(calendarEvents);
        },
        errCallback
      );
    });
    return calendarEvents;
}

module.exports = {
    get: function (req, callback, errCallback) {
        getAllCalendars(req, callback, errCallback);
    },
    getEvents: function (req, callback, errCallback) {
        getEventsFromAllCalendars(req, callback, errCallback);
    }
};