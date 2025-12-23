import { useEffect, useState } from 'react';

import { createSocket } from '../lib/socket';

const useSocket = (path) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!path) {
            setSocket(null);
            return undefined;
        }

        const ws = createSocket(path);
        setSocket(ws);

        return () => {
            ws.disconnect();
            setSocket(null);
        };
    }, [path]);

    return socket;
};

export default useSocket;
