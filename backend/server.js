require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Serve Static Frontend for production / multi-container 
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback error handling
app.use('/api', (req, res) => {
    res.status(404).json({ error: "API Endpoint Not Found" });
});

// React Router Fallback
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// We export `app` for testing purposes
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`High-performance Node server running on port ${PORT}`);
    });
}

module.exports = app;
