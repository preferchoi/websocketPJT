import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

import ChatLog from '../components/ChatLog';

import './room.css'

const Room = () => {
    const API_URL = import.meta.env.VITE_API_URL;

    const [WS, setWS] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const navigate = useNavigate();

    const { nspName, roomName } = useParams();
    useEffect(() => {
        const ws = io(`${API_URL}/${nspName}/${roomName}`);
        setWS(ws);
        const addMessage = (message) => {
            console.log("Received message: ", message);  // 이 로그가 출력되는지 확인
            setMessages((prevMessages) => [...prevMessages, {'type':'text', 'content':message}]);
        };
        ws.on('receive_message', addMessage);
        return () => {
            ws.off('receive_message', addMessage);
            ws.disconnect();
        };
    }, []);

    const sendMessage = () => {
        if (WS) {
            WS.emit('send_message', newMessage);
            setNewMessage("");
        }
    };
    return (
        <>
            <h2>현재 {roomName} 방 접속중입니다.</h2>
            <button className='exit' onClick={() => { navigate(`/${nspName}`) }}>나가기</button>
            <div className="chat">
                <ChatLog messages={messages} />
                <div>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </>
    )
}

export default Room;