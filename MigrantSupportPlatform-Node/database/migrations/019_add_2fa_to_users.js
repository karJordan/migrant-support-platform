exports.up = (pgm) => {
    pgm.addColumns('users', {
        two_factor_code_hash: {
            type: 'varchar(255)',
            notNull: false
        },
        two_factor_expires_at: {
            type: 'timestamp',
            notNull: false
        }
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('users', [
        'two_factor_code_hash',
        'two_factor_expires_at'
    ]);
};