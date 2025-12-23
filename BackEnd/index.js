const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { createStateManager } = require('./state');
const config = require('./config');
const { buildStateSnapshot, createRoomNamespace, normalizeRoomLimit } = require('./socket/rooms');
const { registerMainNamespaceHandlers } = require('./socket/handlers');
const createRoomsRouter = require('./routes/rooms');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.CORS_ORIGINS,
        methods: ['GET', 'POST']
    }
});

app.use(cors({ origin: config.CORS_ORIGINS }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
};

const stateManager = createStateManager({
    statePath: config.STATE_PATH,
    debounceMs: config.SAVE_STATE_DEBOUNCE_MS,
    buildSnapshot: () => buildStateSnapshot(serverEndPoint),
});

const roomContext = { io, serverEndPoint, config, stateManager };
const createRoom = (nspName, roomName, roomLimit, options) => (
    createRoomNamespace(roomContext, nspName, roomName, roomLimit, options)
);

registerMainNamespaceHandlers({ io, serverEndPoint, config });

const roomsRouter = createRoomsRouter({
    serverEndPoint,
    createRoomNamespace: createRoom,
    stateManager,
    config,
});
app.use('/', roomsRouter);

void (async () => {
    const savedState = await stateManager.loadState();
    if (savedState) {
        Object.entries(savedState).forEach(([nspName, value]) => {
            if (!serverEndPoint[nspName]) {
                return;
            }
            Object.entries(value.rooms || {}).forEach(([roomName, info]) => {
                const roomLimit = normalizeRoomLimit(info.connection_limit, `${nspName}/${roomName}`, config);
                createRoom(nspName, roomName, roomLimit, { persist: false });
            });
        });
    }
})();

/*
에러 발생으로 서버 강제 종료 시 처리
pm2를 이용했기 때문에, 종료 시 자동으로 재시작 됨.
*/
process.on('uncaughtException', (err) => {
    console.error('An uncaught exception occurred:', err);
    Object.keys(serverEndPoint).forEach((key) => {
        serverEndPoint[key].connect = false;
    });
    void stateManager.saveState('uncaughtException').finally(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.warn('SIGTERM received. Attempting to save state before shutdown.');
    void stateManager.saveState('SIGTERM').finally(() => {
        process.exit(0);
    });
});

server.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}/`);
});
