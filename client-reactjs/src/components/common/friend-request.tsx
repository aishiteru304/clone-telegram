import { Collapse, CollapseProps } from "antd"
import { useEffect, useState } from "react"
import { ACCESSTOKEN_KEY } from "../../app/constant"
import useLocalStorage from "../../hooks/useLocalStorage"
import socket from "../../socket"
import useHandleResponseError from "../../hooks/handleResponseError"

const FriendRequest = () => {
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)
    const handleResponseError = useHandleResponseError()
    const [friendRequestList, setFriendRequestList] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Friend Request',
            children: <div>
                {
                    !isLoading && friendRequestList.length == 0 &&
                    <span className="text-center mt-10">No friend requests</span>
                }
                {
                    !isLoading && friendRequestList.length != 0 &&
                    friendRequestList.map((item: any) => (
                        <div key={item._id} className="flex justify-between items-center mt-2">
                            <span className="text-center">{item.fullName}</span>
                            <div className="flex gap-2 text-white">
                                <button className="bg-primary px-2 py-1 rounded-md">Xác nhận</button>
                                <button className="px-2 py-1 text-red-500 border-red-500 rounded-md border-[1px]">Xóa</button>
                            </div>
                        </div>
                    ))

                }
            </div>,
        },
    ]

    useEffect(() => {
        if (accessToken) {
            // Gửi thông điệp đến server để lấy danh sách lời mời
            socket.emit('getFriendsRequest', accessToken.accessToken);
        }

        // Lắng nghe sự kiện 'friendsRequestList' từ server
        socket.on('friendsRequestList', (friendsRequest) => {
            setFriendRequestList(friendsRequest)
            setIsLoading(false)
        });

        // Lắng nghe sự kiện 'newRequestFriend' từ server
        socket.on('newRequestFriend', (newRequestFriend) => {
            setFriendRequestList(newRequestFriend.friendsRequest)
        });

        // Lắng nghe sự kiện lỗi nếu có
        socket.on('error', (error) => {
            handleResponseError(error)
            setIsLoading(false)
        });

    }, [])

    return (
        <Collapse items={items} />
    )
}

export default FriendRequest