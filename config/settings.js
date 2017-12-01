const config = require('./googleapi-key.json');
const CALENDAR_IDS = ['global.solution.architect.m_ads.mx@bbva.com', 'alejandromanuel.mendez.aragua@bbva.com'];
module.exports.key = config.private_key; 
module.exports.serviceAcctId = config.client_email;
module.exports.calendarIds = CALENDAR_IDS;
module.exports.timezone = 'UTC-06:00';