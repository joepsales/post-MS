const mongoose = require('mongoose');

const devConfig = require('../config/dev.json');
const DB_URI = devConfig.db;

function connect(){
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'development'){
            mongoose.connect(DB_URI, 
                { useNewUrlParser: true })
                .then((res, err) => {
                    if (err) return reject(err);
                    resolve();
                })
        }
    })
}

function close() {
    return mongoose.disconnect();
}

module.exports = { connect, close };
