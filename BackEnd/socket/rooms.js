const sharp = require('sharp');

function emitSocketError(socket, message) {
    socket.emit('error', { message });
}

function normalizeImagePayload(data) {
    if (!data) {
        return { error: 'image payload is required' };
    }

    const payload = data && data.data ? data.data : data;

    if (Buffer.isBuffer(payload)) {
        return { buffer: payload, size: payload.length };
    }

    if (payload instanceof ArrayBuffer) {
        const buffer = Buffer.from(payload);
        return { buffer, size: buffer.length };
    }

    if (ArrayBuffer.isView(payload)) {
        const buffer = Buffer.from(payload.buffer, payload.byteOffset, payload.byteLength);
        return { buffer, size: payload.byteLength };
    }

    if (typeof payload === 'string') {
        const buffer = Buffer.from(payload, 'base64');
        return { buffer, size: buffer.length };
    }

    return { error: 'image payload type is invalid' };
}

function normalizeRoomLimit(value, contextLabel, config) {
    const parsed = Number(value);
    const isValid = Number.isInteger(parsed)
        && parsed >= config.MIN_ROOM_LIMIT
        && parsed <= config.MAX_ROOM_LIMIT;
    if (!isValid) {
        const label = contextLabel ? ` (${contextLabel})` : '';
        console.warn(`Invalid roomLimit${label}: ${value}. Using default ${config.DEFAULT_ROOM_LIMIT}.`);
        return config.DEFAULT_ROOM_LIMIT;
    }
    return parsed;
}

function buildStateSnapshot(serverEndPoint) {
    const snapshot = {};
    Object.entries(serverEndPoint).forEach(([nspName, value]) => {
        snapshot[nspName] = {
            rooms: Object.fromEntries(
                Object.entries(value.rooms).map(([roomName, info]) => [
                    roomName,
                    { connection_limit: info.connection_limit }
                ])
            )
        };
    });
    return snapshot;
}

function createRoomNamespace(context, nspName, roomName, roomLimit, { persist } = { persist: true }) {
    const { io, serverEndPoint, config, stateManager } = context;
    try {
        if (serverEndPoint[nspName]['rooms'][roomName]) {
            return false;
        }
        const nsp = io.of(`/${nspName}/${roomName}`);
        const info = {
            'connection_now': 0,
            'connection_limit': roomLimit,
            'isAbleConnect': true,
        };
        serverEndPoint[nspName]['rooms'][roomName] = info;
        nsp.on('connection', (socket) => {
            if (info['connection_now'] >= info['connection_limit']) {
                socket.emit('server_full', '서버가 가득 찼습니다. 다른 서버를 이용해주세요.');
                socket.disconnect(true);
                return;
            }
            info['connection_now'] += 1;
            if (info['connection_now'] === info['connection_limit']) {
                info['isAbleConnect'] = false;
            }
            nsp.emit('receive_message', `${socket.id} 님이 서버에 접속했습니다.`);

            socket.on('send_message', (data) => {
                if (typeof data !== 'string') {
                    emitSocketError(socket, 'message type is invalid');
                    return;
                }
                if (data.length > config.MAX_MESSAGE_LENGTH) {
                    emitSocketError(socket, 'message length exceeds limit');
                    return;
                }
                nsp.emit('receive_message', `${socket.id}: ${data}`);
            });

            socket.on('send_image', async (data) => {
                // 이미지 데이터 저장 후, 원본 파일 저장 경로 추가 전송 필요함
                const normalized = normalizeImagePayload(data);
                if (normalized.error) {
                    emitSocketError(socket, normalized.error);
                    return;
                }
                if (normalized.size > config.MAX_IMAGE_BYTES) {
                    emitSocketError(socket, 'image size exceeds limit');
                    return;
                }
                const inputBuffer = normalized.buffer;
                const resizedImageBuffer = await sharp(inputBuffer)
                    .resize({
                        width: config.IMAGE_RESIZE_WIDTH,
                        fit: 'inside'
                    })
                    .toBuffer();
                const mimeType = data && typeof data.mimeType === 'string' ? data.mimeType : 'image/jpeg';
                nsp.emit('receive_image', { data: resizedImageBuffer, mimeType });
            });

            socket.on('disconnect', () => {
                nsp.emit('receive_message', `${socket.id} 님이 서버에서 나갔습니다.`);
                info['connection_now'] -= 1;
                if (info['connection_now'] < info['connection_limit']) {
                    info['isAbleConnect'] = true;
                }
                if (info['connection_now'] <= 0) {
                    delete serverEndPoint[nspName]['rooms'][roomName];
                    nsp.removeAllListeners('connection');
                    nsp.disconnectSockets(true);
                    io.of(`/${nspName}`).emit('delete_room', '');
                    if (persist) {
                        stateManager.scheduleSaveState(`room cleanup ${nspName}/${roomName}`);
                    }
                }
            });
        });

        if (persist) {
            stateManager.scheduleSaveState(`room created ${nspName}/${roomName}`);
        }
        return true;
    } catch (error) {
        console.error(`Failed to create room namespace ${nspName}/${roomName}:`, error);
        return false;
    }
}

module.exports = {
    buildStateSnapshot,
    createRoomNamespace,
    emitSocketError,
    normalizeRoomLimit,
};
