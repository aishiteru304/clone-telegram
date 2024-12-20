import { IoMenu } from "react-icons/io5";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useEffect, useState } from "react";
import { ACCESSTOKEN_KEY, INFORMATION_KEY } from "../../app/constant";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useHandleResponseError from "../../hooks/handleResponseError";
import socket from "../../socket";
import { Drawer } from "antd";
import { IoIosLogOut } from "react-icons/io";

const SideBar = () => {
    const { getLocalStorage, removeLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)
    const [friendList, setFriendList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const location = useLocation()
    const handleResponseError = useHandleResponseError()
    const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
    const information = getLocalStorage(INFORMATION_KEY)
    const navigate = useNavigate()

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

    const handleLogout = () => {
        removeLocalStorage(ACCESSTOKEN_KEY)
        removeLocalStorage(INFORMATION_KEY)
        navigate("/login")
    }
    return (
        <>
            <section>
                <search className="flex gap-2 items-center ">
                    <IoMenu className="text-2xl cursor-pointer" onClick={() => setIsOpenDrawer(true)} />
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
            <Drawer
                title={
                    <div className={`flex gap-2 items-center`}>
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                            {information.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className=" uppercase">{information.fullName}</span>
                    </div>
                }
                placement="left" // Trượt từ bên trái
                onClose={() => setIsOpenDrawer(false)}
                open={isOpenDrawer}
                width={300} // Độ rộng của sidebar
                closable={false} // Tắt icon close
            >
                <p>Nội dung 1</p>
                <p>Nội dung 2</p>
                <p>Nội dung 3</p>
                <div className="flex items-center cursor-pointer">
                    <IoIosLogOut className="text-3xl" />
                    <span onClick={handleLogout} className="  text-xl font-medium">Logout</span>
                </div>

            </Drawer>
        </>
    )
}

export default SideBar