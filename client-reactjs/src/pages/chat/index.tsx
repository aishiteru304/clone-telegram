import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getInformationById } from "./api"
import useHandleResponseError from "../../hooks/handleResponseError"
import socket from "../../socket"
import { UserStatus } from "../../dto/user"

const ChatPage = () => {
    const { id } = useParams()
    const handleResponseError = useHandleResponseError()
    const [information, setInformation] = useState<any>(null)
    const [isOnline, setIsOnline] = useState<boolean>(false)

    useEffect(() => {
        if (!id) return
        getInformationById(id)
            .then(res => {
                setInformation(res.data)
            })
            .catch(err => {
                handleResponseError(err)
            })

        // Gửi yêu cầu kiểm tra trạng thái online của user
        socket.emit('isUserOnline', id);

        // Xóa listener cũ trước khi thêm listener mới
        socket.off('userOnlineStatus');

        // Nhận về trạng thái
        socket.on('userOnlineStatus', (data: UserStatus) => {
            if (data.userId == id)
                setIsOnline(data.isOnline)
        });
    }, [id])


    return (
        <div>
            {
                information &&
                <header className="bg-white py-2 px-4 border border-l-[1px]">
                    <div>
                        <p>{information.fullName}</p>
                        {!isOnline && <p className="text-sm text-slate-500">Offline</p>}
                        {isOnline && <p className="text-sm text-green-500">Online</p>}
                    </div>
                </header>
            }

        </div>
    )
}

export default ChatPage