const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    sendVerificationCode,
    sendPasswordResetCode
} = require('../utils/mailer');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        const user = result.rows[0];

        const twoFactorCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const twoFactorCodeHash = await bcrypt.hash(
            twoFactorCode,
            10
        );

        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await pool.query(
            `UPDATE users
     SET two_factor_code_hash = $1,
         two_factor_expires_at = $2
     WHERE id = $3`,
            [twoFactorCodeHash, expiresAt, user.id]
        );

        await sendVerificationCode(
            user.email,
            twoFactorCode
        );

        res.status(201).json({
            requiresTwoFactor: true,
            userId: user.id
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and Password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();

        const twoFactorCodeHash = await bcrypt.hash(twoFactorCode, 10);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            `UPDATE users
     SET two_factor_code_hash = $1,
         two_factor_expires_at = $2
     WHERE id = $3`,
            [twoFactorCodeHash, expiresAt, user.id]
        );

        await sendVerificationCode(user.email, twoFactorCode);

        res.json({
            requiresTwoFactor: true,
            userId: user.id
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/verify-2fa
router.post('/verify-2fa', async (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
        return res.status(400).json({
            message: 'User ID and verification code are required'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        const user = result.rows[0];

        if (!user || !user.two_factor_code_hash || !user.two_factor_expires_at) {
            return res.status(400).json({
                message: 'Invalid verification request'
            });
        }

        if (new Date() > new Date(user.two_factor_expires_at)) {
            return res.status(400).json({
                message: 'Verification code has expired'
            });
        }

        const validCode = await bcrypt.compare(
            code.toString(),
            user.two_factor_code_hash
        );

        if (!validCode) {
            return res.status(400).json({
                message: 'Invalid verification code'
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await pool.query(
            `UPDATE users
             SET two_factor_code_hash = NULL,
                 two_factor_expires_at = NULL
             WHERE id = $1`,
            [user.id]
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                country_of_origin: user.country_of_origin,
                current_address: user.current_address,
                current_city: user.current_city,
                current_country: user.current_country,
                phone_number: user.phone_number,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: 'Email is required'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        // Always return the same response so we do not reveal
        // whether an email address exists in the database.
        if (!user) {
            return res.json({
                message:
                    'If an account exists for that email, a reset code has been sent.'
            });
        }

        // Generate a 6-digit password reset code
        const resetCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Store only the hashed version of the reset code
        const resetCodeHash = await bcrypt.hash(
            resetCode,
            10
        );

        // Reset code expires after 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await pool.query(
            `UPDATE users
             SET password_reset_code_hash = $1,
                 password_reset_expires_at = $2
             WHERE id = $3`,
            [
                resetCodeHash,
                expiresAt,
                user.id
            ]
        );

        // Email the real reset code to the user
        await sendPasswordResetCode(
            user.email,
            resetCode
        );

        res.json({
            message:
                'If an account exists for that email, a reset code has been sent.'
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

// POST /api/auth/verify-reset-code
router.post('/verify-reset-code', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({
            message: 'Email and reset code are required'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        if (
            !user ||
            !user.password_reset_code_hash ||
            !user.password_reset_expires_at
        ) {
            return res.status(400).json({
                message: 'Invalid password reset request'
            });
        }

        // Check whether the reset code has expired
        if (
            new Date() >
            new Date(user.password_reset_expires_at)
        ) {
            return res.status(400).json({
                message: 'Password reset code has expired'
            });
        }

        // Compare the submitted code with the stored hash
        const validCode = await bcrypt.compare(
            code.toString(),
            user.password_reset_code_hash
        );

        if (!validCode) {
            return res.status(400).json({
                message: 'Invalid password reset code'
            });
        }

        res.json({
            message: 'Reset code verified'
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const {
        email,
        code,
        newPassword
    } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({
            message:
                'Email, reset code, and new password are required'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        if (
            !user ||
            !user.password_reset_code_hash ||
            !user.password_reset_expires_at
        ) {
            return res.status(400).json({
                message: 'Invalid password reset request'
            });
        }

        // Check whether the reset code has expired
        if (
            new Date() >
            new Date(user.password_reset_expires_at)
        ) {
            return res.status(400).json({
                message: 'Password reset code has expired'
            });
        }

        // Compare the submitted code with the stored hash
        const validCode = await bcrypt.compare(
            code.toString(),
            user.password_reset_code_hash
        );

        if (!validCode) {
            return res.status(400).json({
                message: 'Invalid password reset code'
            });
        }

        // Hash the user's new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // Update the password and clear the reset code
        // so it cannot be reused.
        await pool.query(
            `UPDATE users
             SET password = $1,
                 password_reset_code_hash = NULL,
                 password_reset_expires_at = NULL
             WHERE id = $2`,
            [
                hashedPassword,
                user.id
            ]
        );

        res.json({
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;