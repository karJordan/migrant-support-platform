const pool = require('../db');

// Community categories are optional. Omission on PATCH preserves the stored ID.
module.exports = function validateCategory(type, { optional = false } = {}) {
    return async (req, res, next) => {
        if (req.method === 'PATCH' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const supplied = Object.prototype.hasOwnProperty.call(req.body, 'category_id');
        const value = req.body.category_id;
        if (!supplied && req.method === 'PATCH') return next();
        if (value === null || value === undefined) {
            if (!optional) {
                return res.status(400).json({ message: 'Category is required' });
            }
            req.body.category_id = null;
            return next();
        }
        // Accept decimal IDs from HTML selects as well as JSON numbers.
        const id = typeof value === 'string' && /^[1-9]\d*$/.test(value)
            ? Number(value) : value;
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0 || id > 2147483647) {
            return res.status(400).json({ message: 'Category ID must be a positive integer' });
        }
        try {
            const result = await pool.query('SELECT applies_to FROM categories WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(400).json({ message: 'Category does not exist' });
            }
            if (!result.rows[0].applies_to.includes(type)) {
                return res.status(400).json({ message: `Category is not available for ${type} content` });
            }
            req.body.category_id = id;
            return next();
        } catch (error) {
            console.error('Category validation failed:', error.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};
