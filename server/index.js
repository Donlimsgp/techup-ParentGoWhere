// /server/index.js

const express = require('express');
const path = require('path');
const app = express();
const PORT = 8000;

// Serve the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Define a route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
