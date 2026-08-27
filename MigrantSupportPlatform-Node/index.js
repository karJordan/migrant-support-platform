require("dotenv").config();
const express = require('express');
const cors = require('cors');
const pool = require("./db");
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const jobsRoutes = require('./routes/jobs');
const authenticateToken = require('./middleware/authMiddleware');


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());

app.use('/api/services', servicesRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Node API is working!' });
    });
//temporary route to test authentication middleware
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'You are authenticated!',
        user: req.user
    });
});

pool.query("SELECT NOW()")
    .then((result) => {
        console.log("Connected to PostgreSQL:", result.rows[0].now);
    })
    .catch((error) => {
        console.error("PostgreSQL connection failed:", error.message);
    });

if(require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        });
    }

module.exports = app; // Export the app for testing