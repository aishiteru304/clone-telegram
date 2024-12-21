import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { checkRelationship, getInformationById } from "./api"
import useHandleResponseError from "../../hooks/handleResponseError"
import socket from "../../socket"
import { UserStatus } from "../../dto/user"
import ReceiverRequest from "../../components/chat/receiver-request"
import SenderRequest from "../../components/chat/sender-request"
import NoRelationship from "../../components/chat/no-relationship"

const ChatPage = () => {
    const { id } = useParams()
    const handleResponseError = useHandleResponseError()
    const [information, setInformation] = useState<any>(null)
    const [isOnline, setIsOnline] = useState<boolean>(false)
    const navigate = useNavigate()
    const [relationship, setRelationShip] = useState<any>(null)

    useEffect(() => {
        if (!id) return
        getInformationById(id)
            .then(res => {
                setInformation(res.data)
            })
            .catch(err => {
                if (err?.status == 500)
                    navigate("/")
                handleResponseError(err)
            })

        checkRelationship(id)
            .then(res => {
                console.log(res.data.data)
                setRelationShip(res.data.data)
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

        // Xóa listener cũ trước khi thêm listener mới
        socket.off('relationship');
        socket.on("relationship", (data) => {
            setRelationShip(data)
        })

    }, [id])


    return (
        <div>
            {
                information &&
                <div>
                    <header className="bg-white py-2 px-4 border border-l-[1px]">
                        <div>
                            <p>{information.fullName}</p>
                            {!isOnline && <p className="text-sm text-slate-500">Offline</p>}
                            {isOnline && <p className="text-sm text-green-500">Online</p>}
                        </div>
                    </header>
                    {
                        relationship?.isReceiverRequest &&
                        <ReceiverRequest />
                    }
                    {
                        relationship?.isSendRequest &&
                        <SenderRequest />
                    }
                    {
                        relationship?.noRelationship &&
                        <NoRelationship />
                    }

                </div>
            }

        </div>
    )
}

export default ChatPage