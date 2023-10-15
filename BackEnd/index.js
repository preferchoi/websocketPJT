const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 8000
const cors = require('cors');

app.use(cors());

const serverEndPoint = {
    'mainserver001': {
        'connect': false,
        'rooms': {}
    },
    'mainserver002': {
        'connect': false,
        'rooms': {}
    },
    'mainserver003': {
        'connect': false,
        'rooms': {}
    },
    'mainserver004': {
        'connect': false,
        'rooms': {}
    },
    'mainserver005': {
        'connect': false,
        'rooms': {}
    },
    'mainserver006': {
        'connect': false,
        'rooms': {}
    },
    'mainserver007': {
        'connect': false,
        'rooms': {}
    },
    'mainserver008': {
        'connect': false,
        'rooms': {}
    }
}

app.get('/mainserver', (req, res) => {
    const mainServerNames = Object.entries(serverEndPoint).map(([key, value]) => {
        return {
            name: key,
            connect: value.connect,
            roomsLength: Object.keys(value.rooms).length
        };
    })
    res.json(mainServerNames);
});


server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});