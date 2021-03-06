const express = require('express');
const Post = require('../models/Post');
const FbPost = require('../models/FbPost');
const amqp = require('amqplib/callback_api');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require("jsonwebtoken");
let secret = [
    "-----BEGIN PUBLIC KEY-----",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi8SSBA2xo7GjLUpU3oZqFUJK4e5KSbAKdrwU32r2H0rs1+N0tY93E/LOVn5FsfXhbAwB0znS3lctvr+4kIpsgzPTzKN9mtK0oGjKQXCGBh53IjHK8NNz2v9DKRo2NMPSncbmUGp2WhkXVmu/WdMt1pJQJ10IhQX1c1xAezmZa4Xvttd+93XWVTi66RiRVCxyt9C7urc/+W9FPLsV3XG8aageMc9Ta5ySLr9bWC1H8kcRSIrmZF3rSOWGG/lwSlQNMF1Ztrslf+8rgjp5jVuYuuZcKewjfqdnvPMYQqDpQaA9G3x1MXjkrhSArTfdHw4h8VNpAbNJZBI9IeOkO2FfKQIDAQAB",
    "-----END PUBLIC KEY-----",
].join("\n");

const app = express();
app.use(cors());
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
            channel.sendToQueue('post_created', Buffer.from(JSON.stringify(fbPost)));
            console.log(`Post with content ${fbPost} posted to post_created.`);
            // axios.post(`https://graph.facebook.com/${pageId}/feed?message=${fbPost.content}&access_token=${token}`, null)
            //     .then(result => {
            //         res.status(200).json({ message: `Succesfully published Facebook post to page ${pageId}.` });
            //     }).catch((err) => {
            //         console.log('error')
            //         res.status(500).send(err);
            //     })
            // fbPost.save();


            //     .then(createdPost => {
            //         res.status(201).send(createdPost);
            //     }).catch((err) => {
            //         res.status(400).send(err);
            //     });
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
            jwt.verify(
                req.headers.authorization.replace("Bearer ", ""),
                secret,
                { algorithms: ["RS256"] },
                function (err, decoded) {
                    if (err) {
                        throw err;
                    }
                    Post.find()
                        .then(documents => {
                            // Message broker here
                            res.status(200).json({
                                message: 'Posts fetched succesfully',
                                posts: documents
                            });
                        });
                }
            )
        });

        // Get Post By ID
        router.get("/:id", (req, res, next) => {
            jwt.verify(
                req.headers.authorization.replace("Bearer ", ""),
                secret,
                { algorithms: ["RS256"] },
                function (err, decoded) {
                    if (err) {
                        throw err;
                    }
                    Post.findById(req.params.id).then(post => {
                        if (post) {
                            res.status(200).json(post);
                        } else {
                            res.status(404).json({ message: 'Post not found' });
                        }
                    });
                }
            )
            
        });

        // Delete Post By ID
        router.delete("/:id", (req, res, next) => {
            Post.deleteOne({ _id: req.params.id }).then(result => {
                console.log(result);
                // channel.sendToQueue('post_deleted', Buffer.from(req.params.id));
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


module.exports = router, app;