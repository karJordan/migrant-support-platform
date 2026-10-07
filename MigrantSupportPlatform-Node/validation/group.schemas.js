const { z } = require('zod');
const { optionalCategoryIdField, titleField, descriptionField } = require('./fields');

const communityGroupSchema = z.object({
    category_id: optionalCategoryIdField,
    name: titleField,
    description: descriptionField,
});

module.exports = { communityGroupSchema };