import { useState, useEffect } from 'react'
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';


const Lobby = () => {
    const [server, setServer] = useState({ userList: [] })
    const [WS, setWS] = useState(null);
    const [messages, setMessages] = useState(['1234']);
    const [newMessage, setNewMessage] = useState("");
    const [roomList, setRoomList] = useState([]);
    const [roomName, setRoomName] = useState('');

    const navigate = useNavigate();
    const { serverName } = useParams();

    useEffect(() => {
        const ws = io(`http://localhost:8000/${serverName}`);
        setWS(ws);
        const addMessage = (message) => {
            console.log("Received message: ", message);  // 이 로그가 출력되는지 확인
            setMessages((prevMessages) => [...prevMessages, message]);
        };
        ws.on('receive_message', addMessage);
        return () => {
            ws.off('receive_message', addMessage);
        };
    }, []);

    const sendMessage = () => {
        if (WS) {
            WS.emit('send_message', newMessage);
            setNewMessage("");
        }
    };

    useEffect(() => {
        if (WS) {
            const getData = async () => {
                try {
                    const res = await axios.get(`http://localhost:8000/${serverName}/users`);
                    setServer(res.data);
                } catch (error) {
                    console.error(error);
                }
            };
            getData();
            return () => {
                WS.disconnect();
                setWS(null)
            };
        }
    }, [WS]);

    const create_room = () => {
        if (roomName) {
            axios.get(`http://localhost:8000/${serverName}/create_room`, {
                'params': {
                    roomName
                }
            }
            ).then(res => {
                console.log(res);
                navigate(`/${serverName}/${roomName}`);
            })
        } else {
            alert('roomName을 입력해주세요.')
        }
    }

    return (
        <>

            <div>
                <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                />
                <button onClick={create_room}>방 만들기</button>
            </div>
            <h1>
                현재 {serverName} 서버 접속중입니다.
            </h1>
            <div>
                <h3>접속자 목록</h3>
                {server?.userList.map((el, key) => (<p key={key}>{el}</p>))}
            </div>

            <div>
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

export default Lobby;