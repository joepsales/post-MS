process.env.NODE_ENV = 'development';

// Project Imports
const app = require('./app');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('dotenv').config();

const token = process.env.ACCESS_TOKEN;
const pageId = process.env.PAGE_ID;

const http = require('http');
const debug = require('debug')('node-angular');

app.post('/posttopage', (req, res) => {
    const text = req.body.text;

    axios.post(`https://graph.facebook.com/${pageId}/feed?message=${text}&access_token=${token}`, null)
    .then(result => {
        res.status(200).json({ message: `Succesfully published Facebook post to page ${pageId}.` });
    }).catch((err) => {
        res.status(500).send(err);
    })
})

const normalizePort = val => {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
};

const onError = error => {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
    debug("Listening on " + bind);
}



const port = normalizePort(process.env.PORT || "3001");
app.set("port", port);
app.use(cors());

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);