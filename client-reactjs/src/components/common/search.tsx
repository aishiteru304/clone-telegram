import { IoMenu } from "react-icons/io5";
import { io } from "socket.io-client";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useEffect, useState } from "react";
import { ACCESSTOKEN_KEY } from "../../app/constant";

const SearchComponent = () => {
    const socket = io('http://localhost:3000');
    const { getLocalStorage } = useLocalStorage()
    const [friendList, setFriendList] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const accessToken = getLocalStorage(ACCESSTOKEN_KEY)
        if (accessToken) {
            // Gửi thông điệp đến server để lấy danh sách bạn bè
            socket.emit('getFriends', accessToken.accessToken);
        }

        // Lắng nghe sự kiện 'friendsList' từ server
        socket.on('friendsList', (friends) => {
            setFriendList(friends)
            setIsLoading(false)
        });

        // Lắng nghe sự kiện lỗi nếu có
        socket.on('error', (error) => {
            console.error('Lỗi:', error.message);
            setIsLoading(false)
        });

    }, [])
    return (
        <section>
            <search className="flex gap-2 items-center ">
                <IoMenu className="text-2xl cursor-pointer" />
                <input placeholder="Search" className="w-full bg-gray-200 outline-none pl-4 py-2 rounded-3xl" />
            </search>
            <div>
                {
                    !isLoading && friendList.length == 0 &&
                    <p className="text-center mt-10">Please add friend to chat</p>
                }
                {
                    !isLoading && friendList.length != 0 &&
                    <div className="mt-4">
                        {
                            friendList.map((friend: any) => (
                                <li key={friend._id} className=" list-none flex gap-2 items-center p-2 cursor-pointer hover:bg-slate-300 rounded-lg transition-all duration-300 ease-in-out ">
                                    <div className="h-10 w-10 rounded-full bg-green-500"></div>
                                    <span>{friend.fullName}</span>
                                </li>
                            ))
                        }
                    </div>
                }
            </div>
        </section>
    )
}

export default SearchComponent