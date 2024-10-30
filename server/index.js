const express = require('express');
const path = require('path');
const app = express();
const PORT = 8000;

// Serve the public folder for static files
app.use(express.static(path.join(__dirname, '../public')));

// Define a route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Provide an endpoint to send the API key securely
app.get('/api-key', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
