const { z } = require('zod');
const { EMPLOYMENT_TYPES } = require('./constants');
const { categoryIdField, titleField, descriptionField, locationField, companyField } = require('./fields');

// status and created_by are deliberately not here: the route sets them
const jobSchema = z.object({
    category_id: categoryIdField,
    title: titleField,
    company: companyField,
    location: locationField,
    description: descriptionField,
    employment_type: z.enum(EMPLOYMENT_TYPES, { message: 'Select an employment type' }),
});

module.exports = { jobSchema };