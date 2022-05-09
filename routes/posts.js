const express = require('express');
const Post = require('../models/Post');
const FbPost = require('../models/FbPost');
const axios = require('axios');
const amqp = require('amqplib/callback_api');

require('dotenv').config({ path: require('find-config')('.env') })
const router = express.Router();

const token = process.env.ACCESS_TOKEN;
const pageId = process.env.PAGE_ID;

// Message Broker
amqp.connect('amqps://lzvlbhtr:6cvrOb5ZwKBJ1bJJJ3OOMKESR0Jhoyd8@chinook.rmq.cloudamqp.com/lzvlbhtr', (error0, connection) => {
    if (error0) {
        throw error0
    }

    connection.createChannel((error1, channel) => {
        if (error1) {
            throw error1
        }

        // Create Post
        router.post('', (req, res, next) => {
            const post = new Post({
                title: req.body.title,
                location: req.body.location
            });
            post.save()
                .then(createdPost => {
                    channel.sendToQueue('post_created', Buffer.from(JSON.stringify(createdPost)));
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
            Post.findOneAndUpdate({ _id: req.params.id }, post).then(result => {
                channel.sendToQueue('post_updated', Buffer.from(JSON.stringify(result)));
                res.status(200).json({ message: 'Update successful' });
            }).catch(() => {
                res.status(500).send('Error: Could not updated post.');
            });
        })

        // Get All Posts
        router.get("", (req, res, next) => {
            Post.find()
                .then(documents => {
                    // Message broker here
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
                    res.status(404).json({ message: 'Post not found' });
                }
            });
        });

        // Delete Post By ID
        router.delete("/:id", (req, res, next) => {
            Post.deleteOne({ _id: req.params.id }).then(result => {
                console.log(result);
                channel.sendToQueue('post_deleted', Buffer.from(req.params.id));
                res.status(200).json({
                    message: 'Post deleted.'
                });
            });
        });


    })
})

process.on('beforeExit', () => {
    consolog.log('closing RabbitMQ connection.');
    connection.close();
})


module.exports = router;