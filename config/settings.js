const config = require('./googleapi-key.json');
const CALENDAR_ID = ['global.solution.architect.m_ads.mx@bbva.com', 'alejandromanuel.mendez.aragua@bbva.com'];
module.exports.key = config.private_key; 
module.exports.serviceAcctId = config.client_email;
module.exports.calendarId = CALENDAR_ID;
module.exports.timezone = 'UTC-06:00';