const { z } = require('zod');
const { RULES, EMPLOYMENT_TYPES } = require('./constants');
const { categoryIdField, titleField, descriptionField, locationField } = require('./fields');

// status and created_by are deliberately not here: the route sets them
const jobSchema = z.object({
    category_id: categoryIdField,
    title: titleField,
    company: z
        .string()
        .trim()
        .min(1, 'Company is required')
        .max(RULES.COMPANY_MAX, `Must be under ${RULES.COMPANY_MAX} characters`),
    location: locationField,
    description: descriptionField,
    employment_type: z.enum(EMPLOYMENT_TYPES, { message: 'Select an employment type' }),
});

module.exports = { jobSchema };