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

    const [newImage, setNewImage] = useState(null); // 이미지 파일

    const navigate = useNavigate();

    const { nspName, roomName } = useParams();
    
    useEffect(() => {
        const ws = io(`${API_URL}/${nspName}/${roomName}`);
        setWS(ws);

        const addMessage = (message) => {
            setMessages((prevMessages) => [...prevMessages, {'type':'text', 'content':message}]);
        };

        const addImage = (message) => {
            console.log(message);
            setMessages((prevMessages) => [...prevMessages, {'type':'image', 'content':message}]);
        }

        ws.on('receive_message', addMessage);
        ws.on('receive_image', addImage);
        return () => {
            ws.off('receive_message', addMessage);
            ws.disconnect();
        };
    }, []);

    const handleImageUpload = (el) => {
        const file = el.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                setNewImage(reader.result);
            };
        }
    }

    const sendMessage = () => {
        if (WS) {
            WS.emit('send_message', newMessage);
            setNewMessage("");
        }
    };

    const sendImage = () => {
        if (!newImage) {
            alert('이미지를 입력해주세요.')
        }
        if (WS && newImage) {
            const blob = new Blob([newImage], { type: 'image/png' })
            WS.emit('send_image', blob);
            setNewImage(null);
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
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <button onClick={sendImage}>Image</button>
                </div>
            </div>
        </>
    )
}

export default Room;