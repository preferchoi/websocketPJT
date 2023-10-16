import { useState, useEffect } from 'react'
import axios from "axios";
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const Lobby = () => {
    const [server, setServer] = useState('')
    const { serverName } = useParams();
    const [WS, setWS] = useState(null);

    useEffect(() => {
        const ws = io(`http://localhost:8000/${serverName}`);
        setWS(ws);
        console.log(ws);
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
            {server?.userList} / {serverName}
        </>
    )
}

export default Lobby;