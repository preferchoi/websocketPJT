import axios from 'axios';
import { API_URL } from '../apis';

export const getUser = async (serverName) => {
    try {
        const res = await axios.get(`${API_URL}/${serverName}/users`);
        return res.data.userList;
    } catch (error) {
        console.error(error);
        return null
    }
};

export const getRoom = async (serverName) => {
    try {
        const res = await axios.get(`${API_URL}/${serverName}/rooms`);
        console.log('rooms', res.data.roomList);
        return res.data.roomList;
    } catch (error) {
        console.error(error);
        return null
    }
};


