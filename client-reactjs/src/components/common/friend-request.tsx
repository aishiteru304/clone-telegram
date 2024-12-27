import { Collapse, CollapseProps } from "antd"
import { useEffect, useState } from "react"
import { ACCESSTOKEN_KEY, COLORS_LIST, MAX_COLOR } from "../../app/constant"
import useLocalStorage from "../../hooks/useLocalStorage"
import socket from "../../socket"
import useHandleResponseError from "../../hooks/handleResponseError"
import DeleteFriend from "../friend/delete-friend"
import { getConversationByMembers, getInformations } from "./api"
import { useNavigate } from "react-router-dom"

const FriendRequest = ({ notification }: { notification: number }) => {
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)
    const handleResponseError = useHandleResponseError()
    const [requestReceived, setRequestReceived] = useState([])
    const [requestSent, setRequestSent] = useState([])
    const [listFriend, setListFriend] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    const handleToConversation = (id: string) => {
        const userIds = [id]
        getConversationByMembers(userIds)
            .then(res => {
                navigate(`/conversation/${res.data._id}`)
            })
            .catch(err => {
                handleResponseError(err)
            })
    }

    const handleDeleteRequest = (userId: string) => {
        if (!accessToken) return
        socket.emit('deleteFriendRequest', { accessToken: accessToken.accessToken, userId });
    }

    const handleRejectRequest = (userId: string) => {
        if (!accessToken) return
        socket.emit('rejectFriendRequest', { accessToken: accessToken.accessToken, userId });
    }

    const handleAcceptRequest = (userId: string) => {
        if (!accessToken) return
        socket.emit('acceptFriendRequest', { accessToken: accessToken.accessToken, userId });
    }

    const handleSeenRequest = () => {
        if (notification != 0) {
            socket.emit("seenFriendRequest")
        }
    }


    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: <span className="flex items-center gap-2" onClick={handleSeenRequest}>Request Received {!!notification && <span className="bg-red-500 w-5 h-5 rounded-full text-white flex items-center justify-center">{notification}</span>}</span>,
            children: <div>
                {
                    !isLoading && requestReceived.length == 0 &&
                    <span className="text-center mt-10">No friend requests</span>
                }
                {
                    !isLoading && requestReceived.length != 0 &&
                    requestReceived.map((item: any) => (
                        <div key={item._id} className="flex justify-between items-center mt-2">
                            <span className="text-center">{item.fullName}</span>
                            <div className="flex gap-2 text-white">
                                <button className="bg-primary px-2 py-1 rounded-md" onClick={() => handleAcceptRequest(item._id)}>Accept</button>
                                <button className="px-2 py-1 text-red-500 border-red-500 rounded-md border-[1px]" onClick={() => handleRejectRequest(item._id)}>Delete</button>
                            </div>
                        </div>
                    ))

                }
            </div>,
        },
        {
            key: '2',
            label: 'Request Sent',
            children: <div>
                {
                    !isLoading && requestSent.length == 0 &&
                    <span className="text-center mt-10">No friend requests</span>
                }
                {
                    !isLoading && requestSent.length != 0 &&
                    requestSent.map((item: any) => (
                        <div key={item._id} className="flex justify-between items-center mt-2">
                            <span className="text-center">{item.fullName}</span>
                            <button className="px-2 py-1 text-red-500 border-red-500 rounded-md border-[1px]" onClick={() => handleDeleteRequest(item._id)}>Delete</button>
                        </div>
                    ))

                }
            </div>,
        },
        {
            key: '3',
            label: 'List Friend',
            children: <div>
                {
                    !isLoading && listFriend.length == 0 &&
                    <span className="text-center mt-10">No friend requests</span>
                }
                {
                    !isLoading && listFriend.length != 0 &&
                    listFriend.map((item: any, index) => {
                        const bgColor = COLORS_LIST[index % MAX_COLOR]
                        return (
                            <div key={item._id} className="flex relative gap-2 items-center justify-between mt-2 hover:bg-slate-400 p-2 rounded-md transition-all duration-300 ease-in-out cursor-pointer" onClick={() => handleToConversation(item._id)}>
                                <div className="flex gap-2 items-center">
                                    <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center text-white`}>
                                        {item.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{item.fullName}</span>
                                </div>
                                <DeleteFriend userId={item._id} />
                            </div>
                        )
                    })

                }
            </div>,
        },
    ]

    useEffect(() => {
        getInformations()
            .then(res => {
                setListFriend(res.data.friends)
                setRequestSent(res.data.friendsRequestSent)
                setRequestReceived(res.data.friendsRequest)
            })
            .catch(err => {
                handleResponseError(err)
            })
            .finally(() => setIsLoading(false))

        socket.on('newRequestFriend', (user) => {
            setRequestReceived(user.friendsRequest)
        });

        // Lắng nghe sự kiện 'newRequestSent' từ server
        socket.on('newRequestSent', (user) => {
            setRequestSent(user.friendsRequestSent)
        });

        // Lắng nghe sự kiện 'friendsList' từ server
        socket.on('friendsList', (user) => {
            setListFriend(user.friends)
        });

        // Lắng nghe sự kiện lỗi nếu có
        socket.on('error', (error) => {
            handleResponseError(error)
            setIsLoading(false)
        });

    }, [])


    return (
        <Collapse items={items} accordion />
    )
}

export default FriendRequest