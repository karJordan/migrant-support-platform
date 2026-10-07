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


const urlField = z
    .string()
    .trim()
    .max(RULES.URL_MAX, `Must be under ${RULES.URL_MAX} characters`)
    .refine(isHttpUrl, 'Enter a valid http(s) link');


const categoryIdField = z
    .union([z.number().int(), z.string().regex(/^\d+$/)], { message: 'Select a category' })
    .transform((value) => Number(value))
    .pipe(
        z.number()
            .positive('Select a category')
            .max(2147483647, 'Select a category')
    );

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
    .min(RULES.LOCATION_MIN, `Must be at least ${RULES.LOCATION_MIN} characters`)
    .max(RULES.LOCATION_MAX, `Must be under ${RULES.LOCATION_MAX} characters`);

const companyField = z
    .string()
    .trim()
    .min(RULES.COMPANY_MIN, `Must be at least ${RULES.COMPANY_MIN} characters`)
    .max(RULES.COMPANY_MAX, `Must be under ${RULES.COMPANY_MAX} characters`);

const optionalCategoryIdField = z
    .union([z.null(), categoryIdField], { message: 'Select a valid category' })
    .optional();


module.exports = { urlField, categoryIdField, optionalCategoryIdField, titleField, descriptionField, locationField, companyField };