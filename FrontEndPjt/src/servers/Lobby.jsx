import { useState, useEffect } from 'react'
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';


const Lobby = () => {
    const [WS, setWS] = useState(null);
    const [userList, setUserList] = useState([])
    const [messages, setMessages] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [newMessage, setNewMessage] = useState("");
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
        ws.on('connect_user', getUserData)
        ws.on('disconnect_user', getUserData)
        ws.on('create_room', getRoomData)

        return () => {
            ws.off('receive_message', addMessage);
            ws.off('connect_user', getUserData);
            ws.off('disconnect_user', getUserData);
            ws.off('create_room', getRoomData);
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
            getUserData();
            return () => {
                WS.disconnect();
                setWS(null)
            };
        }
    }, [WS]);

    const getUserData = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/${serverName}/users`);
            setUserList(res.data.userList);
        } catch (error) {
            console.error(error);
        }
    };

    const getRoomData = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/${serverName}/rooms`);
            setRoomList(res.data.roomList);
            console.log('rooms', roomList);
        } catch (error) {
            console.error(error);
        }
    };

    const create_room = () => {
        if (roomName) {
            axios.get(`http://localhost:8000/${serverName}/create_room`, {
                'params': {
                    roomName
                }
            }
            ).then(res => {
                console.log(res);
                WS.emit('create_room', '');
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
                {userList?.map((el, index) => (<p key={index}>{el}</p>))}
            </div>

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

export default Lobby;