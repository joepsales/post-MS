const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// Create Post
router.post('', (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.location
    });
    post.save()
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