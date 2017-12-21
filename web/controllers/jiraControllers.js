const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

exports.createTicket = [

//     body('calendarEvents').isLength({min: 1}),
    body('calendarEvents').custom((item) => Array.isArray(item) && item.length > 0)
        .withMessage("You must select at least one event"),
//     sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            let calendarEvents = JSON.parse(req.body.completeCalendarEvents);
            res.render('calendars-details', {
                title: 'GSA | Calendars Details',
                calendarEvents: calendarEvents,
                authorised: req.isAuthenticated(),
                errors: errors.array()
            });
        }
        else {
            // Data from form is valid.
            // Check if events already exists in Jira.
            next();
        }
    }
];
