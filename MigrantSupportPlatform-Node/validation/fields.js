const { z } = require('zod');
const { RULES } = require('./constants');

const isHttpUrl = (value) => {
    try {
        const { protocol } = new URL(value);
        return protocol === 'http:' || protocol === 'https:';
    } catch {
        return false;
    }
};

// http(s) only, so javascript: links are rejected
const urlField = z
    .string()
    .trim()
    .max(RULES.URL_MAX, `Must be under ${RULES.URL_MAX} characters`)
    .refine(isHttpUrl, 'Enter a valid http(s) link');

// "" coerces to 0, which fails positive()
const categoryIdField = z.coerce
    .number({ message: 'Select a category' })
    .int('Select a category')
    .positive('Select a category');

const titleField = z
    .string()
    .trim()
    .min(RULES.TITLE_MIN, `Must be at least ${RULES.TITLE_MIN} characters`)
    .max(RULES.TITLE_MAX, `Must be under ${RULES.TITLE_MAX} characters`);

const descriptionField = z
    .string()
    .trim()
    .min(RULES.DESC_MIN, `Must be at least ${RULES.DESC_MIN} characters`)
    .max(RULES.DESC_MAX, `Must be under ${RULES.DESC_MAX} characters`);

const locationField = z
    .string()
    .trim()
    .min(1, 'Location is required')
    .max(RULES.LOCATION_MAX, `Must be under ${RULES.LOCATION_MAX} characters`);

module.exports = { urlField, categoryIdField, titleField, descriptionField, locationField };