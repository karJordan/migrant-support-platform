const inputValidation = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    // Trimmed values, unknown keys (e.g. status) stripped
    req.body = result.data;
    next();
};

module.exports = inputValidation;