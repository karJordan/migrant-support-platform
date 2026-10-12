exports.up = (pgm) => {
    pgm.addColumns("users", {
        password_reset_code_hash: {
            type: "varchar(255)",
            notNull: false,
        },
        password_reset_expires_at: {
            type: "timestamp",
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns("users", [
        "password_reset_code_hash",
        "password_reset_expires_at",
    ]);
};