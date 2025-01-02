import { Link, useNavigate } from "react-router-dom"
import useLocalStorage from "../../hooks/useLocalStorage"
import { ACCESSTOKEN_KEY, COLORS_LIST, INFORMATION_KEY, MAX_COLOR } from "../../app/constant"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import socket from "../../socket"
import { Dropdown, Space } from "antd"
import { BsThreeDotsVertical } from "react-icons/bs"

const PrivateConversationItem = ({ conversation, index, notify }: { conversation: any, index: number, notify: boolean }) => {
    const { getLocalStorage } = useLocalStorage()
    const information = getLocalStorage(INFORMATION_KEY)
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)
    const bgColor = COLORS_LIST[index % MAX_COLOR]

    const classNames = `${location.pathname == `/conversation/${conversation._id}` ? "bg-primary text-white hover:bg-primary" : ""}`
    const conversationNotifications = useSelector((state: RootState) => state.notification.conversation)
    const navigate = useNavigate()

    const handleSeenMessage = () => {
        if (!conversationNotifications.includes(conversation._id) || !accessToken) return
        // Lắng nghe sự kiện 'seenMessage' từ server
        const data = { conversationId: conversation._id, accessToken: accessToken.accessToken }
        socket.emit('seenMessage', data);
    }

    const handleHiddenConversation = () => {
        if (!accessToken) return
        socket.emit('hiddenConversation', { conversationId: conversation._id, accessToken: accessToken.accessToken });
        navigate("/")

    }
    return (
        <Link
            to={`/conversation/${conversation._id}`} key={conversation._id}
            onClick={handleSeenMessage}
        >

            <span>
                {
                    conversation?.members?.map((member: any, index: string) => {
                        if (member._id != information?.userId) {
                            return (
                                <li key={index}
                                    className={`list-none flex gap-2 items-center p-2 cursor-pointer hover:bg-slate-300 rounded-lg transition-all duration-300 ease-in-out ${classNames} relative`}>
                                    <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center text-white`}>
                                        {member.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <span key={index}>{member.fullName} </span>
                                    {notify && <span className=" absolute right-8 bg-red-500 px-2 py-1 rounded-md text-xs text-white">new</span>}
                                    <div className="flex items-center cursor-pointer  rounded-xl absolute right-0">
                                        <Dropdown
                                            menu={{
                                                items: [
                                                    {
                                                        key: '0',
                                                        label: (
                                                            <button className="text-red-500" onClick={(e) => { e.stopPropagation(), handleHiddenConversation() }}>Hidden Conversation</button>
                                                        ),
                                                    },
                                                ]
                                            }}
                                            trigger={['click']}>
                                            <span onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="flex items-center p-4 hover:bg-slate-600 rounded-lg">
                                                <Space>
                                                    <BsThreeDotsVertical />
                                                </Space>
                                            </span>
                                        </Dropdown>
                                    </div>
                                </li>
                            )
                        }
                        return null
                    })
                }

            </span>
        </Link>
    )
}

export default PrivateConversationItem