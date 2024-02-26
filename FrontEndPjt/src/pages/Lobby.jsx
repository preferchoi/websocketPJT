import { useState, useEffect } from 'react'
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

import ChatLog from '../components/ChatLog';

import { API_URL, getUser, getRoom } from '../apis';

import './Lobby.css'

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
        const ws = io(`${API_URL}/${serverName}`);
        setWS(ws);
        ws.on('receive_message', addMessage);
        ws.on('connect_user', getUserData)
        ws.on('disconnect_user', getUserData)
        ws.on('create_room', getRoomData)
        ws.on('delete_room', getRoomData)

        getUserData();
        getRoomData();

        return () => {
            ws.off('receive_message', addMessage);
            ws.off('connect_user', getUserData);
            ws.off('disconnect_user', getUserData);
            ws.off('create_room', getRoomData);
            ws.off('delete_room', getRoomData)
            ws.disconnect();
            setWS(null)
        };
    }, []);

    const addMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, { 'type': 'text', 'content': message }]);
    };

    const sendMessage = () => {
        if (WS) {
            WS.emit('send_message', newMessage);
            setNewMessage("");
        }
    };

    const getUserData = async () => {
        const userList = await getUser(serverName);
        if (userList != null) {
            setUserList(userList);
        }

    };

    const getRoomData = async () => {
        const roomList = await getRoom(serverName)
        if (roomList != null) {
            setRoomList(roomList);
        }
    };

    const create_room = () => {
        if (roomName) {
            axios.get(`${API_URL}/${serverName}/create_room`, {
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
            <h1 className='title'>
                현재 {serverName} 서버 접속중입니다.
            </h1>

            <div className="main">
                <div className='userList'>
                    <h3>접속자 목록</h3>
                    {userList?.map((el, index) => (<p key={index}>{el}</p>))}
                </div>
                <div className="room">
                    <h3>방 목록</h3>
                    <div className='roomList'>
                        {roomList?.map((el, index) => (
                            <div className='roomCell' key={index} onClick={() => { navigate(`/${serverName}/${el}`) }} >{el}</div>
                        ))}
                    </div>
                    <div className='createRoom'>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                        <button onClick={create_room}>방 만들기</button>
                    </div>
                </div>
            </div>

            <div className="chat">
                <ChatLog messages={messages} />
                <div className='chatInput'>
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

export default Lobby;