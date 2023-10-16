import { useState, useEffect } from 'react'
import axios from "axios";
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const Lobby = () => {
    const [server, setServer] = useState({ userList: [] })
    const { serverName } = useParams();
    const [WS, setWS] = useState(null);

    useEffect(() => {
        const ws = io(`http://localhost:8000/${serverName}`);
        setWS(ws);
    }, []);

    useEffect(() => {
        if (WS) {
            const getData = async () => {
                try {
                    const res = await axios.get(`http://localhost:8000/${serverName}/users`);
                    setServer(res.data);
                    console.log(res.data);
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

    return (
        <>
            <h1>
                현재 {serverName} 서버 접속중입니다.
            </h1>
            <div>
                <h3>접속자 목록</h3>
                {server?.userList.map((el,key) => (<p key={key}>{el}</p>))}
            </div>
        </>
    )
}

export default Lobby;