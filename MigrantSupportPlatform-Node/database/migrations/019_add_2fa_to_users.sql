-- Up Migration
pgm.addColumns('users', {
    two_factor_code_hash: {
        type: 'varchar(6)',
        notNull: false
    },
    two_factor_expires_at: {
        type: 'timestamp',
        notNull: false
    }
});
-- Down Migration
pgm.dropColumns('users', [
    'two_factor_code_hash',
    'two_factor_expires_at'
]);