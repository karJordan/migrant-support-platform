require("dotenv").config();
const express = require('express');
const cors = require('cors');
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ message: 'Node API is working!' });
    });

pool.query("SELECT NOW()")
    .then((result) => {
        console.log("Connected to PostgreSQL:", result.rows[0].now);
    })
    .catch((error) => {
        console.error("PostgreSQL connection failed:", error.message);
    });    
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});