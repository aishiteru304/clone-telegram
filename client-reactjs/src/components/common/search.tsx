import { IoMenu } from "react-icons/io5";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useEffect, useState } from "react";
import { ACCESSTOKEN_KEY } from "../../app/constant";
import { Link, useLocation } from "react-router-dom";
import useHandleResponseError from "../../hooks/handleResponseError";
import socket from "../../socket";

const SearchComponent = () => {
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)
    const [friendList, setFriendList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const location = useLocation()
    const handleResponseError = useHandleResponseError()

    useEffect(() => {
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
            handleResponseError(error)
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
                                <Link to={`/conversation/${friend._id}`} key={friend._id} className={`flex gap-2 items-center p-2 cursor-pointer hover:bg-slate-300 rounded-lg transition-all duration-300 ease-in-out ${location.pathname == `/conversation/${friend._id}` ? "bg-primary text-white hover:bg-primary" : ""}`}>
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        {friend.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{friend.fullName}</span>
                                </Link>
                            ))
                        }
                    </div>
                }
            </div>
        </section>
    )
}

export default SearchComponent