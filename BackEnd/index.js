const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 8000

const serverEndPoint = {
    'mainserver001': {
        'connnect': false,
        'rooms': {}
    },
    'mainserver002': {
        'connnect': false,
        'rooms': {}
    },
    'mainserver003': {
        'connnect': false,
        'rooms': {}
    },
    'mainserver004': {
        'connnect': false,
        'rooms': {}
    },
    'mainserver005': {
        'connnect': false,
        'rooms': {}
    },
    'mainserver006': {
        'connnect': false,
        'rooms': {}
    },
    'mainserver007': {
        'connnect': false,
        'rooms': {}
    },
    'mainserver008': {
        'connnect': false,
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