const { emitSocketError } = require('./rooms');

function initializeNamespace(serverEndPoint, key) {
    console.log(`Namespace ${key} is initialized.`);
    serverEndPoint[key].connect = true;
}

function registerMainNamespaceHandlers({ io, serverEndPoint, config }) {
    Object.keys(serverEndPoint).forEach((nspName) => {
        const nsp = io.of(`/${nspName}`);
        initializeNamespace(serverEndPoint, nspName);

        nsp.on('connection', (socket) => {
            if (Object.keys(serverEndPoint[nspName]['users']).length < config.MAX_USERS_PER_NAMESPACE) {
                console.log(`User connected to ${nspName}`);
                serverEndPoint[nspName]['users'][socket.id] = socket.handshake;
                nsp.emit('receive_message', `${socket.id} 님이 서버에 접속했습니다.`);
                nsp.emit('connect_user', '');

                if (Object.keys(serverEndPoint[nspName]['users']).length >= config.MAX_USERS_PER_NAMESPACE) {
                    serverEndPoint[nspName]['connect'] = false;
                }

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
                    console.log(data);
                });

                socket.on('create_room', () => {
                    nsp.emit('create_room', '');
                });

                socket.on('disconnect', () => {
                    delete serverEndPoint[nspName]['users'][socket.id];
                    nsp.emit('receive_message', `${socket.id} 님이 서버에서 나갔습니다.`);
                    nsp.emit('disconnect_user', '');
                    if (Object.keys(serverEndPoint[nspName]['users']).length < config.MAX_USERS_PER_NAMESPACE) {
                        serverEndPoint[nspName]['connect'] = true;
                    }
                });
            } else {
                socket.emit('server_full', '서버가 가득 찼습니다. 다른 서버를 이용해주세요.');
                socket.disconnect();
            }
        });
    });
}

module.exports = {
    registerMainNamespaceHandlers,
};
