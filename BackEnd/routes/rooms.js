const express = require('express');
const { normalizeRoomLimit } = require('../socket/rooms');

function createRoomsRouter({ serverEndPoint, createRoomNamespace, stateManager, config }) {
    const router = express.Router();

    /*
    웹소켓 1차 네임스페이스 목록 불러오는 함수
    요소 형식
    {
        name: 네임스페이스 이름,
        connect: 연결 가능 여부,
        usersLength: 접속 인원 수
    }
    */
    router.get('/mainserver', (req, res) => {
        const mainServerNames = Object.entries(serverEndPoint).map(([key, value]) => {
            return {
                name: key,
                connect: value.connect,
                usersLength: Object.keys(value.users).length
            };
        });
        res.json(mainServerNames);
    });

    /*
        nsp에 접속한 유저 목록 불러오는 함수
    */
    router.get('/:nsp/users', (req, res) => {
        const nspName = req.params.nsp;

        if (!serverEndPoint[nspName]) {
            res.status(404).json({ error: 'Namespace not found' });
            return;
        }

        if (serverEndPoint[nspName].connect) {
            const userList = Object.keys(serverEndPoint[nspName]['users']);
            res.json({ userList });
        } else {
            res.status(404).json({ error: 'Namespace not found' });
        }
    });

    /*
        nsp에 생성된 방 목록 불러오는 함수
    */
    router.get('/:nsp/rooms', (req, res) => {
        const nspName = req.params.nsp;

        if (!serverEndPoint[nspName]) {
            res.status(404).json({ error: 'Namespace not found' });
            return;
        }

        if (serverEndPoint[nspName].connect) {
            const roomList = Object.keys(serverEndPoint[nspName]['rooms']);
            res.json({ roomList });
        } else {
            res.status(404).json({ error: 'Namespace not found' });
        }
    });

    /*
        미니 방 생성
        {
            roomName : {
                connection_now: int, // 현재 방 접속 인원 수
                connection_limit: int, // 방 접속 제한 인원
                isAbleConnenct: bool // 접속 가능 여부
            }
        } 
    */
    router.post('/:nsp/create_room', (req, res) => {
        const nspName = req.params.nsp;
        const roomName = typeof req.body.roomName === 'string' ? req.body.roomName.trim() : '';
        const roomLimit = normalizeRoomLimit(req.body.roomLimit, `${nspName}/${roomName}`, config);
        const roomNamePattern = config.ROOM_NAME_PATTERN;
        const minRoomNameLength = config.ROOM_NAME_MIN_LENGTH;
        const maxRoomNameLength = config.ROOM_NAME_MAX_LENGTH;

        if (!serverEndPoint[nspName]) {
            res.status(400).json({ error: 'Namespace not found' });
            return;
        }

        if (!roomName) {
            res.status(400).json({ error: 'roomName is required' });
            return;
        }

        if (roomName.length < minRoomNameLength || roomName.length > maxRoomNameLength) {
            res.status(400).json({ error: 'roomName length is invalid' });
            return;
        }

        if (!roomNamePattern.test(roomName)) {
            res.status(400).json({ error: 'roomName contains invalid characters' });
            return;
        }

        const created = createRoomNamespace(nspName, roomName, roomLimit);
        if (created) {
            stateManager.scheduleSaveState(`create_room endpoint ${nspName}/${roomName}`);
            res.json('success');
            return;
        }
        res.status(409).json({ error: 'roomName already exists' });
    });

    return router;
}

module.exports = createRoomsRouter;
