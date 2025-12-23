import { useCallback, useEffect, useState } from 'react';

import useSocket from './useSocket';

const useChatRoom = (nspName, roomName) => {
    const socketPath = nspName && roomName ? `${nspName}/${roomName}` : null;
    const socket = useSocket(socketPath);
    const [messages, setMessages] = useState([]);

    const createMessageId = useCallback((socketId) => `${Date.now()}-${socketId ?? 'unknown'}`, []);

    const addMessage = useCallback((message) => {
        const id = createMessageId(socket?.id);
        setMessages((prevMessages) => [...prevMessages, { id, 'type': 'text', 'content': message }]);
    }, [createMessageId, socket?.id]);

    const addImage = useCallback((message) => {
        console.log(message);
        const id = createMessageId(socket?.id);
        setMessages((prevMessages) => [...prevMessages, { id, 'type': 'image', 'content': message }]);
    }, [createMessageId, socket?.id]);

    useEffect(() => {
        if (!socket) {
            return undefined;
        }

        socket.on('receive_message', addMessage);
        socket.on('receive_image', addImage);

        return () => {
            socket.off('receive_message', addMessage);
            socket.off('receive_image', addImage);
        };
    }, [socket, addMessage, addImage]);

    const sendMessage = useCallback((message) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !socket) {
            return false;
        }
        socket.emit('send_message', trimmedMessage);
        return true;
    }, [socket]);

    const sendImage = useCallback((imagePayload) => {
        if (!imagePayload || !socket) {
            return false;
        }
        socket.emit('send_image', {
            data: imagePayload.data,
            mimeType: imagePayload.mimeType || 'image/png',
        });
        return true;
    }, [socket]);

    return {
        socket,
        messages,
        sendMessage,
        sendImage,
    };
};

export default useChatRoom;
