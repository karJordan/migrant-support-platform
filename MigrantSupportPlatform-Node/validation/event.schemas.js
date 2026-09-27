const { z } = require('zod');
const { DATE_PATTERN, TIME_PATTERN } = require('./constants');
const { categoryIdField, titleField, descriptionField, locationField } = require('./fields');

const communityEventSchema = z.object({
    category_id: categoryIdField,
    title: titleField,
    location: locationField,
    event_date: z.string().regex(DATE_PATTERN, 'Use YYYY-MM-DD'),
    event_time: z.string().regex(TIME_PATTERN, 'Use HH:MM'),
    description: descriptionField,
});

module.exports = { communityEventSchema };