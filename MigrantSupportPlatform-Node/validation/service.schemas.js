const { z } = require('zod');
const { RULES, PHONE_PATTERN } = require('./constants');
const {
    categoryIdField,
    titleField,
    descriptionField,
    locationField,
    urlField,
} = require('./fields');

const serviceSchema = z.object({
    category_id: categoryIdField,
    name: titleField,
    description: descriptionField,
    location: locationField,
    phone: z
        .string()
        .trim()
        .min(RULES.PHONE_MIN, `Must be at least ${RULES.PHONE_MIN} digits`)
        .max(RULES.PHONE_MAX, `Must be under ${RULES.PHONE_MAX} digits`)
        .regex(PHONE_PATTERN, 'Enter a valid phone number'),
    website: urlField,
});

const serviceUpdateSchema = serviceSchema.extend({ category_id: categoryIdField.optional() });

module.exports = { serviceSchema, serviceUpdateSchema };