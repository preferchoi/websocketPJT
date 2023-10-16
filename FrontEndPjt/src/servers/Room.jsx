import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const Room = () => {
    const [WS, setWS] = useState(null);
    const { nspName, roomName } = useParams();
    useEffect(() => {
        const ws = io(`http://localhost:8000/${nspName}/${roomName}`);
        setWS(ws);
        return () => {
            ws.disconnect();
        };
    }, []);
    return (
        <>
            <h2>roomName: {roomName}</h2>
            <p>
                생성된 방 들어옴
            </p>
        </>
    )
}

export default Room;