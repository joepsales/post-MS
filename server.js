const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const PORT = 3000;

app.use(bodyParser.json());

require('./models/Post');
const Post = mongoose.model('Post');
// Main Endpoint
app.get('/', (req, res) => {
    res.send('This is the default endpoint for Post-MS.');
});

app.listen(PORT, () => {
    console.log(`Service running on ${PORT}.`);
})

