const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static files in the current directory (index.html, style.css, app.js)
app.use(express.static(__dirname));

// Send all requests that don't match a static file to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Spinach Ice Cream Authenticity Node running on port ${PORT}`);
});
