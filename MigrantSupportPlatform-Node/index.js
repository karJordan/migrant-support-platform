const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ message: 'Node API is working!' });
    });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});