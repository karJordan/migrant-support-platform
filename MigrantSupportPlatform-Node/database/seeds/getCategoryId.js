const pool = require('../../db');

module.exports = async function getCategoryId(name, type) {
    const result = await pool.query(
        'SELECT id FROM categories WHERE name = $1 AND $2 = ANY(applies_to)',
        [name, type]
    );
    if (result.rows.length === 0) {
        throw new Error(`Missing ${type} category '${name}'. Run npm run seed:categories first.`);
    }
    return result.rows[0].id;
};
