const { z } = require('zod');
const { categoryIdField, titleField, descriptionField } = require('./fields');

const communityGroupSchema = z.object({
    category_id: categoryIdField,
    name: titleField,
    description: descriptionField,
});

module.exports = { communityGroupSchema };