const express = require('express');
const Post = require('../models/Post');
const FbPost = require('../models/FbPost');
const axios = require('axios');

require('dotenv').config({ path: require('find-config')('.env') })
const router = express.Router();

const token = process.env.ACCESS_TOKEN;
const pageId = process.env.PAGE_ID;

// Create Post
router.post('', (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        location: req.body.location
    });
    post.save()
    .then(createdPost => {
        res.status(201).send(createdPost);
    }).catch((err) => {
        res.status(400).send(err);
    });
})

// Create Facebook Post
router.post('/facebook', (req, res, next) => {
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

// Update Post By ID
router.put('/:id', (req, res, next) => {
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        location: req.body.location
    });
    Post.updateOne({_id: req.params.id}, post).then(result => {
        res.status(200).json({message: 'Update successful'});
    }).catch((err) => {
        res.status(500).send(err);
    });
})

// Get All Posts
router.get("", (req, res, next) => {
    Post.find()
        .then(documents => {
            res.status(200).json({
                message: 'Posts fetched succesfully',
                posts: documents
            });
        });    
});

// Get Post By ID
router.get("/:id", (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({message: 'Post not found'});
        }
    });
});

// Delete Post By ID
router.delete("/:id", (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Post deleted.'
        });
    });
});

module.exports = router;