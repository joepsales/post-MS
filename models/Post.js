const mongoose = require('mongoose');

mongoose.model('Post', {
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
})