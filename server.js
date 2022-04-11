// Project Imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Global Variables
const PORT = process.env.PORT || 3000;

// Parse JSON
app.use(bodyParser.json());

// Define Model
require('./models/Post');
const Post = mongoose.model('Post');

// Connect to database
mongoose.connect('mongodb+srv://salesjoep:LB9O4mMvsulQq8G2@social-it.wopsp.mongodb.net/post?retryWrites=true&w=majority', () => {
    try{
        console.log('Connected to post database.');
    } catch{
        console.log('Could not connect to post database.');
    }
})
// Main Endpoint
app.get('/', (req, res) => {
    res.send('This is the default endpoint for Post-MS.');
});

// Create post
app.post('/post', (req, res) => {
    var newPost = {
        title: req.body.title,
        location: req.body.location
    }
    var post = new Post(newPost);
    post.save().then(() => {
        console.log('New post created.');        
        res.status(200);
        res.send('Post created.');
    }).catch((err) => {
        if (err) throw err;
    })
})

// Get all posts
app.get('/posts', (req, res) => {
    Post.find().then((posts) => {
        if (posts.length == 0){
            res.send('Collection is empty.');
        } else {
            res.json(posts);
        }
    }).catch(err => {
        if (err) throw err;
    })
})

// Get post by ID
app.get('/post/:id', (req, res) => {
    Post.findById(req.params.id).then((post) => {
        if (post) res.json(post);
        else {
            res.status(404);
            res.send('Could not find post.');
        }
    }).catch(err => {
        if (err) throw err;
    })
})

// Delete post by ID
app.delete('/post/:id', (req, res) => {
    Post.findOneAndDelete(req.params.id).then((post) => {
        if (post){
            res.send('post removed.');
        }
        else {
            res.status(404);
            res.send('Could not find post.');
        }
    }).catch(err => {
        if (err) throw err;
    })
})

app.listen(PORT, () => {
    console.log(`Service running on ${PORT}.`);
})

