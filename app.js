const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db/index');
const cors = require('cors');

const postsRoutes = require('./routes/posts');

const app = express();

db.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/posts', postsRoutes);

module.exports = app;