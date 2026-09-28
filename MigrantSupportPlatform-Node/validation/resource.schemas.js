const { z } = require('zod');
const { categoryIdField, titleField, descriptionField, urlField } = require('./fields');

const resourceSchema = z.object({
    category_id: categoryIdField,
    title: titleField,
    description: descriptionField,
    link: urlField,
});

const resourceUpdateSchema = resourceSchema.extend({ category_id: categoryIdField.optional() });

module.exports = { resourceSchema, resourceUpdateSchema };