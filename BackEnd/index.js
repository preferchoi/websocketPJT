const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",  // 클라이언트의 주소
        methods: ["GET", "POST"]
    }
});

const port = 8000
const cors = require('cors');

app.use(cors());

// 서버 엔드포인트 목록
const serverEndPoint = {
    'mainserver001': {
        'connect': false,
        'users': {},
        'rooms': {},
    },
    'mainserver002': {
        'connect': false,
        'users': {},
        'rooms': {},
    },
    'mainserver003': {
        'connect': false,
        'users': {},
        'rooms': {},
    },
    'mainserver004': {
        'connect': false,
        'users': {},
        'rooms': {},
    },
    'mainserver005': {
        'connect': false,
        'users': {},
        'rooms': {},
    },
    'mainserver006': {
        'connect': false,
        'users': {},
        'rooms': {},
    },
    'mainserver007': {
        'connect': false,
        'users': {},
        'rooms': {},
    },
    'mainserver008': {
        'connect': false,
        'users': {},
        'rooms': {},
    }
}

/*
네임스페이스 시작 시 connect 활성화 하는 함수
*/
function initializeNamespace(key, nsp) {
    console.log(`Namespace ${key} is initialized.`);
    serverEndPoint[key].connect = true
}

/*
Socket.io 네임스페이스 세팅
*/
Object.keys(serverEndPoint).forEach((key) => {
    const nsp = io.of(`/${key}`);
    initializeNamespace(key, nsp);

    nsp.on('connection', (socket) => {
        console.log(`User connected to ${key}`);
        serverEndPoint[key]['users'][socket.id] = socket.handshake
        io.emit('receive_message', `${socket.id} 님이 서버에 접속했습니다.`);

        socket.on('send_message', (data) => {
            io.emit('receive_message', data);
            console.log(data);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected from ${key}`);
            delete serverEndPoint[key]['users'][socket.id];
            io.emit('receive_message', `${socket.id} 님이 서버에서 나갔습니다.`);
        });
    });
});

/*
웹소켓 1차 네임스페이스 목록 불러오는 함수
요소 형식
{
    name: 네임스페이스 이름,
    connect: 연결 가능 여부,
    usersLength: 접속 인원 수
}
*/
app.get('/mainserver', (req, res) => {
    const mainServerNames = Object.entries(serverEndPoint).map(([key, value]) => {
        return {
            name: key,
            connect: value.connect,
            usersLength: Object.keys(value.users).length
        };
    })
    res.json(mainServerNames);
});

/*
    nsp에 접속한 유저 목록 불러오는 함수
*/
app.get('/:nsp/users', (req, res) => {
    const nspName = req.params.nsp;

    if (serverEndPoint[nspName].connect) {
        const userList = Object.keys(serverEndPoint[nspName]['users']);
        res.json({ userList });
    } else {
        res.status(404).json({ error: 'Namespace not found' });
    }
});

/*
    미니 방 생성 코드
    {
        roomName : {
            connection_now: int, // 현재 방 접속 인원 수
            connection_limit: int, // 방 접속 제한 인원
            isAbleConnenct: bool // 접속 가능 여부
        }
    } 
*/
app.get('/:nsp/create_room', (req, res) => {
    const nspName = req.params.nsp;
    const roomName = req.query.roomName
    const roomLimit = parseInt(req.query.roomLimit, 10) || 8

    if (!serverEndPoint[nspName]['rooms'][roomName]) {
        const nsp = io.of(`/${nspName}/${roomName}`);
        const info = {
            'connection_now': 0,
            'connection_limit': roomLimit,
            'isAbleConnect': true,
        };
        serverEndPoint[nspName]['rooms'][roomName] = info
        nsp.on('connection', (socket) => {
            if (info['connection_now'] < info['connection_limit']) {
                info['connection_now'] += 1
                if (info['connection_now'] === info['connection_limit']) {
                    info['isAbleConnect'] = false
                }
            }

            socket.on('disconnect', () => {
                info['connection_now'] -= 1;
                if (info['connection_now'] < info['connection_limit']) {
                    info['isAbleConnect'] = true
                }
            });
        });
        res.json('success');
    } else {
        res.json('fail');
    }
});

/*
* 에러 발생으로 서버 강제 종료 시 처리
*/
process.on('uncaughtException', (err) => {
    console.error('An uncaught exception occurred:', err);
    Object.keys(serverEndPoint).forEach((key) => {
        serverEndPoint[key].connect = false;
    });
    process.exit(1);
});


server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});