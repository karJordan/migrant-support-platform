const RULES = {
    EMAIL_MAX: 254,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 72,
    NAME_MIN: 2,
    NAME_MAX: 100,
    TITLE_MIN: 2,
    TITLE_MAX: 100,
    POST_TITLE_MIN: 5,
    POST_TITLE_MAX: 100,
    POST_DESCRIPTION_MIN: 10,
    POST_DESCRIPTION_MAX: 1000,
    DESC_MIN: 10,
    DESC_MAX: 5000,
    LOCATION_MIN: 4,
    LOCATION_MAX: 200,
    PHONE_MIN: 7,
    PHONE_MAX: 20,
    URL_MAX: 2048,
    COMPANY_MIN: 2,
    COMPANY_MAX: 100,
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const PHONE_PATTERN = /^[+\d\s()-]+$/;
const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract", "Casual"];

module.exports = { RULES, DATE_PATTERN, TIME_PATTERN, PHONE_PATTERN, EMPLOYMENT_TYPES };