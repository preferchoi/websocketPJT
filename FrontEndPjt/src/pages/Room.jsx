import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

import ChatLog from '../components/ChatLog';
import useChatRoom from '../hooks/useChatRoom';

import './room.css'

const Room = () => {
    const [newMessage, setNewMessage] = useState("");

    const [newImage, setNewImage] = useState(null); // 이미지 파일

    const navigate = useNavigate();

    const { nspName, roomName } = useParams();

    const { messages, sendMessage: emitMessage, sendImage: emitImage } = useChatRoom(nspName, roomName);

    const handleImageUpload = (el) => {
        const file = el.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    setNewImage({ data: reader.result, mimeType: file.type || 'image/png' });
                }
            };
        }
    }

    const sendMessage = () => {
        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage) {
            return;
        }
        const didSend = emitMessage(trimmedMessage);
        if (didSend) {
            setNewMessage("");
        }
    };

    const sendImage = () => {
        if (!newImage) {
            alert('이미지를 입력해주세요.')
            return;
        }
        const didSend = emitImage(newImage);
        if (didSend) {
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
                    <button onClick={sendMessage}>Send Message</button>
                    <br/>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <button onClick={sendImage}>Send Image</button>
                </div>
            </div>
        </>
    )
}

export default Room;
