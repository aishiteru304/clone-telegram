import { IoMenu } from "react-icons/io5";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useEffect, useState } from "react";
import { ACCESSTOKEN_KEY, INFORMATION_KEY } from "../../app/constant";
import { useNavigate } from "react-router-dom";
import useHandleResponseError from "../../hooks/handleResponseError";
import socket from "../../socket";
import { Button, Drawer, Form, Input, message } from "antd";
import { IoIosLogOut } from "react-icons/io";
import FriendRequest from "./friend-request";
import SearchSchema, { SearchValues } from "../../schemas/searchSchema";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getConversations, getIdByPhoneNumber, getNotifications } from "./api";
import PrivateConversationItem from "../conversation/private-conversation-item";
import { TypeConversation } from "../../enums/type-conversation.enum";
import { useDispatch } from "react-redux";
import { addConversation } from "../../redux/notification-slice";
import GroupConversationItem from "../conversation/group-conversation-item";
import { IoMdPersonAdd } from "react-icons/io";
import CreateGroupModal from "../conversation/create-group-modal";

const SideBar = () => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(SearchSchema),
    });
    const { getLocalStorage, removeLocalStorage } = useLocalStorage()
    const [conversationsList, setConversationsList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const handleResponseError = useHandleResponseError()
    const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
    const information = getLocalStorage(INFORMATION_KEY)
    const navigate = useNavigate()
    const [notification, setNotification] = useState<number>(0)
    const [notificationConversation, setNotificationConversation] = useState<string[]>([])
    const dispath = useDispatch()
    const [isShowGroupModal, setIsShowGroupModal] = useState(false)

    useEffect(() => {
        Promise.all([getConversations(), getNotifications()])
            .then(([conversationsRes, notificationsRes]) => {
                setConversationsList(conversationsRes.data);
                setNotification(notificationsRes.data.requestFriend);
                setNotificationConversation(notificationsRes.data.conversation)
                dispath(addConversation(notificationsRes.data.conversation))
            })
            .catch((err) => {
                handleResponseError(err);
            })
            .finally(() => {
                setIsLoading(false);
            });

        // Lắng nghe sự kiện 'updateConversations' từ server
        socket.on('updateConversations', (conversations) => {
            setConversationsList(conversations)
        });

        // Lắng nghe sự kiện 'updateNotificationsConversation' từ server
        socket.on('updateNotificationsConversation', (notifications) => {
            setNotificationConversation(notifications)
            dispath(addConversation(notifications))
        });

        // Lắng nghe sự kiện 'newRequestNotification' từ server
        socket.on('newRequestNotification', (numberNewRequest) => {
            setNotification(numberNewRequest)
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

    const handleSearch = (data: SearchValues) => {
        getIdByPhoneNumber(data)
            .then(res => {
                reset()
                navigate(`/friend/${res.data?._id}`)
            })
            .catch(err => {
                if (err?.status == 404) message.error("User not found")
                handleResponseError(err)
            })
    }

    return (
        <>
            <section className="h-full">
                <search className="flex gap-2 items-center ">
                    <div className="relative">
                        <IoMenu className="text-2xl cursor-pointer" onClick={() => setIsOpenDrawer(true)} />
                        {
                            !!notification &&
                            <div className="w-5 h-5 rounded-full bg-red-500 text-white text-sm flex items-center justify-center absolute -top-3 -right-1">
                                {notification}
                            </div>
                        }
                    </div>
                    <Form onFinish={handleSubmit(handleSearch)} layout="vertical" className="items-center mt-6 flex-grow relative">
                        <Form.Item
                            validateStatus={errors.phone ? 'error' : ''}
                            help={errors.phone?.message}
                        >
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => <Input {...field} placeholder="Enter phone number..." className='h-12' />}
                            />
                        </Form.Item>



                        <Form.Item className=" absolute top-0 right-0">
                            <Button type="primary" htmlType="submit" className='h-12'>
                                Search
                            </Button>
                        </Form.Item>
                    </Form>
                    <IoMdPersonAdd className=" cursor-pointer text-xl" onClick={() => setIsShowGroupModal(true)} />
                </search>
                <div >
                    {
                        !isLoading && conversationsList.length == 0 &&
                        <p className="text-center mt-10">Please add friend to chat</p>
                    }
                    {
                        !isLoading && conversationsList.length != 0 &&
                        <div className="max-h-100vh-96 overflow-y-auto sidebar-scrollbar">
                            {
                                conversationsList.map((conversation: any, index) => {
                                    const notify = notificationConversation.includes(conversation._id)
                                    if (conversation?.type == TypeConversation.PRIVATE) {
                                        return (
                                            <PrivateConversationItem conversation={conversation} key={index} index={index} notify={notify} />
                                        )
                                    }
                                    return <GroupConversationItem conversation={conversation} key={index} index={index} notify={notify} />
                                }
                                )}
                        </div>
                    }
                </div>
            </section>
            <Drawer
                title={
                    <div className={`flex gap-2 items-center`}>
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                            {information && information.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className=" uppercase">{information && information.fullName}</span>
                    </div>
                }
                placement="left" // Trượt từ bên trái
                onClose={() => setIsOpenDrawer(false)}
                open={isOpenDrawer}
                width={400} // Độ rộng của sidebar
                closable={false} // Tắt icon close
            >

                <FriendRequest notification={notification} />
                <div className="flex items-center gap-2 cursor-pointer mt-2">
                    <IoIosLogOut className="text-2xl" />
                    <span onClick={handleLogout} className="  text-lg font-medium">Logout</span>
                </div>

            </Drawer>
            <CreateGroupModal isShowGroupModal={isShowGroupModal} onClose={() => setIsShowGroupModal(false)} />
        </>
    )
}

export default SideBar