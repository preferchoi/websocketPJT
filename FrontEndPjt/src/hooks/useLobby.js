import { useCallback, useEffect, useState } from 'react';

import { getRoom, getUser } from '../apis';
import useSocket from './useSocket';

const useLobby = (serverName) => {
    const socket = useSocket(serverName ? `${serverName}` : null);
    const [userList, setUserList] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [roomLoading, setRoomLoading] = useState(false);
    const [messages, setMessages] = useState([]);

    const createMessageId = useCallback((socketId) => `${Date.now()}-${socketId ?? 'unknown'}`, []);

    const addMessage = useCallback((message) => {
        const id = createMessageId(socket?.id);
        setMessages((prevMessages) => [...prevMessages, { id, 'type': 'text', 'content': message }]);
    }, [createMessageId, socket?.id]);

    const getUserData = useCallback(async () => {
        const userList = await getUser(serverName);
        if (userList != null) {
            setUserList(userList);
        }
    }, [serverName]);

    const getRoomData = useCallback(async () => {
        setRoomLoading(true);
        try {
            const roomList = await getRoom(serverName);
            if (roomList != null) {
                setRoomList(roomList);
            }
        } finally {
            setRoomLoading(false);
        }
    }, [serverName]);

    useEffect(() => {
        if (!socket) {
            return undefined;
        }

        socket.on('receive_message', addMessage);
        socket.on('connect_user', getUserData);
        socket.on('disconnect_user', getUserData);
        socket.on('create_room', getRoomData);
        socket.on('delete_room', getRoomData);

        getUserData();
        getRoomData();

        return () => {
            socket.off('receive_message', addMessage);
            socket.off('connect_user', getUserData);
            socket.off('disconnect_user', getUserData);
            socket.off('create_room', getRoomData);
            socket.off('delete_room', getRoomData);
        };
    }, [socket, addMessage, getRoomData, getUserData]);

    return {
        socket,
        userList,
        roomList,
        roomLoading,
        messages,
        refreshUsers: getUserData,
        refreshRooms: getRoomData,
    };
};

export default useLobby;
