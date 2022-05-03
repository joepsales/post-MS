const express = require('express');
const axios = require('axios');

const router = express.Router();
const FbPost = require('../models/FbPost');


router.post('', (req, res, next) => {
    const fbPost = new FbPost({
        content: req.body.content,
    });
    axios.post(`https://graph.facebook.com/${pageId}/feed?message=${fbPost.content}&access_token=${token}`, null)
    .then(result => {
        res.status(200).json({ message: `Succesfully published Facebook post to page ${pageId}.` });
    }).catch((err) => {
        res.status(500).send(err);
    })
    fbPost.save()
    .then(createdPost => {
        res.status(201).send(createdPost);
    }).catch((err) => {
        res.status(400).send(err);
    });
})