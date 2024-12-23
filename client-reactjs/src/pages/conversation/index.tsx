import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getConversationById } from "./api"
import useHandleResponseError from "../../hooks/handleResponseError"
import useLocalStorage from "../../hooks/useLocalStorage"
import { INFORMATION_KEY } from "../../app/constant"
import socket from "../../socket"
import { UserStatus } from "../../dto/user"
import ConversationContent from "../../components/conversation/conversation-content"

const ConverSationPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const handleResponseError = useHandleResponseError()
    const { getLocalStorage } = useLocalStorage()
    const [information, setInformation] = useState<any>(null)
    const userInfor = getLocalStorage(INFORMATION_KEY)
    const [isOnline, setIsOnline] = useState<boolean>(false)
    const receiverIdRef = useRef<string>("")

    useEffect(() => {
        if (!id || !userInfor) return
        getConversationById(id)
            .then(res => {
                const receiver = res.data.members.filter((member: any) => member._id != userInfor.userId)
                setInformation(receiver[0])
                receiverIdRef.current = receiver[0]._id
                // Gửi yêu cầu kiểm tra trạng thái online của user
                socket.emit('isUserOnline', receiver[0]._id);
            })
            .catch(err => {
                if (err?.status == 500 || err?.status == 404)
                    navigate("/")
                handleResponseError(err)
            })


        // Xóa listener cũ trước khi thêm listener mới
        socket.off('userOnlineStatus');

        // Nhận về trạng thái
        socket.on('userOnlineStatus', (data: UserStatus) => {
            if (data.userId == receiverIdRef.current)
                setIsOnline(data.isOnline)
        });
    }, [id])

    return (
        <div>
            {
                information &&
                <div>
                    <header className="bg-white py-2 px-4 border border-l-[1px] fixed top-0 right-0 w-[70%]">
                        <div>
                            <p>{information.fullName}</p>
                            {!isOnline && <p className="text-sm text-slate-500">Offline</p>}
                            {isOnline && <p className="text-sm text-green-500">Online</p>}
                        </div>
                    </header>

                    <ConversationContent receiverIds={[receiverIdRef.current]} />
                </div>
            }

        </div>
    )
}

export default ConverSationPage