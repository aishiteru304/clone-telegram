import { Dropdown, Space } from "antd"
import { BsThreeDotsVertical } from "react-icons/bs"
import { useParams } from "react-router-dom"
import useLocalStorage from "../../hooks/useLocalStorage"
import { ACCESSTOKEN_KEY } from "../../app/constant"
import socket from "../../socket"

const DeleteFriend = () => {
    const { id } = useParams()
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)

    // Hàm xóa bạn
    const handleDeleteFriend = () => {
        if (!id || !accessToken) return
        socket.emit('deleteFriend', { accessToken: accessToken.accessToken, userId: id });

    }

    return (
        <div className=" fixed top-0 right-4 gap-2 h-16 flex items-center cursor-pointer">
            <Dropdown
                menu={{
                    items: [
                        {
                            key: '0',
                            label: (
                                <button className="text-red-500" onClick={handleDeleteFriend}>Delete Friend</button>
                            ),
                        },
                    ]
                }}
                trigger={['click']}>
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        <BsThreeDotsVertical />
                    </Space>
                </a>
            </Dropdown>
        </div>
    )
}

export default DeleteFriend