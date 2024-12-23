import { Dropdown, Space } from "antd"
import { BsThreeDotsVertical } from "react-icons/bs"
import useLocalStorage from "../../hooks/useLocalStorage"
import { ACCESSTOKEN_KEY } from "../../app/constant"
import socket from "../../socket"

const DeleteFriend = ({ userId }: { userId: string }) => {
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)

    // Hàm xóa bạn
    const handleDeleteFriend = () => {
        if (!accessToken) return
        socket.emit('deleteFriend', { accessToken: accessToken.accessToken, userId });
    }

    return (
        <div className="flex items-center cursor-pointer  rounded-xl">
            <Dropdown
                menu={{
                    items: [
                        {
                            key: '0',
                            label: (
                                <button className="text-red-500" onClick={(e) => { e.stopPropagation(), handleDeleteFriend() }}>Delete Friend</button>
                            ),
                        },
                    ]
                }}
                trigger={['click']}>
                <a onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="flex items-center p-4 hover:bg-slate-600 rounded-lg">
                    <Space>
                        <BsThreeDotsVertical />
                    </Space>
                </a>
            </Dropdown>
        </div>
    )
}

export default DeleteFriend