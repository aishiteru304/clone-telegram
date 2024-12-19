import { io, Socket } from 'socket.io-client';
import { INFORMATION_KEY } from './app/constant';

const userId = localStorage.getItem(INFORMATION_KEY)
    ? JSON.parse(localStorage.getItem(INFORMATION_KEY)!).userId
    : null;

const socket: Socket = io(import.meta.env.VITE_BASE_URL, {
    autoConnect: true,
    auth: userId ? { userId } : {},
});
export default socket;
