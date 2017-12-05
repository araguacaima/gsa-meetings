const settings = require('../config/settings');
const calendarIdList = settings.calendarIds;
const fs = require('fs');
const readline = require('readline');
let google = require('googleapis');
let googleAuth = require('google-auth-library');
const auth_ = require('../config/auth').googleAuth;
const WEB_PATH = '/web';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + '/calendar-token.json';
const calendar = google.calendar('v3');

let params = {
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

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} auth The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(auth, callback) {
    const clientSecret = auth.client_secret;
    const clientId = auth.client_id;
    const redirectUrl = auth.redirect_uris[1];
    const auth_ = new googleAuth();
    const oauth2Client = new auth_.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    oauth2Client.refreshAccessToken(function (err, tokens) {
        if (err) {
            console.log('Error while trying to refresh access token', err);
        } else {
            oauth2Client.credentials = tokens;
            storeToken(tokens);
            callback(oauth2Client);
        }
    });

    oauth2Client.getToken(code, function (err, token) {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

function getEventsFromAllCalendars(auth) {
    params.access_token = auth.access_token;
    params.id_token = auth.id_token;
    calendar.calendarList.list(params)
        .then(resp => {
            console.log(resp);
            listEvents(auth, params, value);
        }).catch(err => {
        console.log(err.message);
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


module.exports = {
    get: function (auth) {
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        if (!auth) {
            authorize(auth_, getEventsFromAllCalendars);
        } else {
            getEventsFromAllCalendars(auth)
        }
    }
};