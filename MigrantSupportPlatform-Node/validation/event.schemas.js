// validation/event.schemas.js
const { z } = require('zod');
const { DATE_PATTERN, TIME_PATTERN } = require('./constants');
const { categoryIdField, titleField, descriptionField, locationField } = require('./fields');

// The regex accepts 2026-02-31, so also check it's a real calendar date
const isRealDate = (value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

// Compare in NZ time, so the server's timezone can't make "today" wrong
const todayInNZ = () =>
    new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' }); // YYYY-MM-DD

const eventDateField = z
    .string()
    .regex(DATE_PATTERN, 'Use YYYY-MM-DD')
    .refine(isRealDate, 'Enter a real date');

const baseEventSchema = z.object({
    category_id: categoryIdField,
    title: titleField,
    location: locationField,
    event_date: eventDateField,
    event_time: z.string().regex(TIME_PATTERN, 'Use HH:MM'),
    description: descriptionField,
});

// POST: date can't be in the past (today is allowed)
const communityEventSchema = baseEventSchema.extend({
    event_date: eventDateField.refine(
        (value) => value >= todayInNZ(),
        'Event date must be today or later'
    ),
});

// PATCH: same rules, but past dates allowed so old events stay editable
const communityEventUpdateSchema = baseEventSchema;

module.exports = { communityEventSchema, communityEventUpdateSchema };