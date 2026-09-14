const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

// GET /api/users/:id
// Get one user's profile
router.get("/:id", authenticateToken, async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    // A normal user should only be able to view their own profile.
    // Admins can view other users.
    if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
    }

    try {
        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                role,
                country_of_origin,
                current_address,
                current_city,
                current_country,
                phone_number,
                created_at
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


// PATCH /api/users/:id
// Update one user's profile
router.patch("/:id", authenticateToken, async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    // Users can only edit themselves.
    // Admins can also edit another user.
    if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
    }

    const {
        name,
        email,
        country_of_origin,
        current_address,
        current_city,
        current_country,
        phone_number,
    } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required",
        });
    }

    try {
        // Prevent a user from changing their email to one already in use.
        const existingEmail = await pool.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
              AND id <> $2
            `,
            [email, userId]
        );

        if (existingEmail.rows.length > 0) {
            return res.status(409).json({
                message: "Email is already in use",
            });
        }

        const result = await pool.query(
            `
            UPDATE users
            SET
                name = $1,
                email = $2,
                country_of_origin = $3,
                current_address = $4,
                current_city = $5,
                current_country = $6,
                phone_number = $7
            WHERE id = $8
            RETURNING
                id,
                name,
                email,
                role,
                country_of_origin,
                current_address,
                current_city,
                current_country,
                phone_number,
                created_at
            `,
            [
                name.trim(),
                email.trim().toLowerCase(),
                country_of_origin?.trim() || null,
                current_address?.trim() || null,
                current_city?.trim() || null,
                current_country?.trim() || null,
                phone_number?.trim() || null,
                userId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            message: "Profile updated successfully",
            user: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;