import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const Room = () => {
    const [WS, setWS] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const navigate = useNavigate();

    const { nspName, roomName } = useParams();
    useEffect(() => {
        const ws = io(`${process.env.REACT_APP_API_URL}/${nspName}/${roomName}`);
        setWS(ws);
        const addMessage = (message) => {
            console.log("Received message: ", message);  // 이 로그가 출력되는지 확인
            setMessages((prevMessages) => [...prevMessages, message]);
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
            <p onClick={() => { navigate(`/${nspName}`) }}>나가기</p>
            <h2>roomName: {roomName}</h2>

            <div>
                <h3>채팅 로그</h3>
                {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>

            <div>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </>
    )
}

export default Room;