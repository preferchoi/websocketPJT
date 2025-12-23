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
    const [roomLoading, setRoomLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [roomName, setRoomName] = useState('');
    const [roomNameError, setRoomNameError] = useState('');

    const navigate = useNavigate();
    const { serverName } = useParams();

    useEffect(() => {
        if (!serverName) {
            return undefined;
        }

        const ws = io(`${API_URL}/${serverName}`);
        setWS(ws);
        ws.on('receive_message', addMessage);
        ws.on('connect_user', getUserData);
        ws.on('disconnect_user', getUserData);
        ws.on('create_room', getRoomData);
        ws.on('delete_room', getRoomData);

        getUserData();
        getRoomData();

        return () => {
            ws.off('receive_message', addMessage);
            ws.off('connect_user', getUserData);
            ws.off('disconnect_user', getUserData);
            ws.off('create_room', getRoomData);
            ws.off('delete_room', getRoomData);
            ws.disconnect();
            setWS(null);
        };
    }, [serverName]);

    const createMessageId = (socketId) => `${Date.now()}-${socketId ?? 'unknown'}`;

    const addMessage = (message) => {
        const id = createMessageId(WS?.id);
        setMessages((prevMessages) => [...prevMessages, { id, 'type': 'text', 'content': message }]);
    };

    const sendMessage = () => {
        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage) {
            return;
        }
        if (WS) {
            WS.emit('send_message', trimmedMessage);
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
        setRoomLoading(true);
        try {
            const roomList = await getRoom(serverName);
            if (roomList != null) {
                setRoomList(roomList);
            }
        } finally {
            setRoomLoading(false);
        }
    };

    const roomNamePattern = /^[A-Za-z0-9가-힣_-]+$/;
    const minRoomNameLength = 1;
    const maxRoomNameLength = 20;

    const validateRoomName = (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return '방 이름을 입력해주세요.';
        }
        if (trimmedValue.length < minRoomNameLength || trimmedValue.length > maxRoomNameLength) {
            return '방 이름은 1~20자로 입력해주세요.';
        }
        if (!roomNamePattern.test(trimmedValue)) {
            return '방 이름은 영문/숫자/한글/언더바/하이픈만 가능합니다.';
        }
        return '';
    };

    const handleRoomNameChange = (event) => {
        const nextValue = event.target.value;
        setRoomName(nextValue);
        setRoomNameError(validateRoomName(nextValue));
    };

    const create_room = async () => {
        const trimmedRoomName = roomName.trim();
        const validationMessage = validateRoomName(trimmedRoomName);
        if (validationMessage) {
            setRoomNameError(validationMessage);
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/${serverName}/create_room`, {
                roomName: trimmedRoomName
            });
            const isSuccess = res?.data?.success;
            if (isSuccess) {
                WS.emit('create_room', '');
                navigate(`/${serverName}/${trimmedRoomName}`);
                return;
            }
            const failMessage = res?.data?.message || '방 생성에 실패했습니다.';
            alert(failMessage);
        } catch (error) {
            console.error(error);
            const status = error?.response?.status;
            const serverErrorMessage = error?.response?.data?.error;
            let errorMessage = serverErrorMessage || '방 생성에 실패했습니다.';

            if (status === 409) {
                errorMessage = serverErrorMessage || '이미 존재하는 방 이름입니다.';
            } else if (status === 400) {
                errorMessage = serverErrorMessage || '잘못된 요청입니다. 입력값을 확인해주세요.';
            } else if (!status) {
                errorMessage = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
            }

            alert(errorMessage);
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
                        {roomLoading ? (
                            <p>방 목록을 불러오는 중입니다...</p>
                        ) : roomList?.length === 0 ? (
                            <p>방이 없습니다.</p>
                        ) : (
                            roomList?.map((el, index) => (
                                <div className='roomCell' key={index} onClick={() => { navigate(`/${serverName}/${el}`) }} >{el}</div>
                            ))
                        )}
                    </div>
                    <div className='createRoom'>
                        <input
                            type="text"
                            value={roomName}
                            onChange={handleRoomNameChange}
                            placeholder="방 이름 (1~20자, 영문/숫자/한글/_-만 허용)"
                            maxLength={maxRoomNameLength}
                            aria-invalid={Boolean(roomNameError)}
                        />
                        {roomNameError && <p className="inputError">{roomNameError}</p>}
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
