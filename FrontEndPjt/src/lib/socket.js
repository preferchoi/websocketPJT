import io from 'socket.io-client';

import { API_URL } from '../apis';

export const createSocket = (path) => io(`${API_URL}/${path}`);
