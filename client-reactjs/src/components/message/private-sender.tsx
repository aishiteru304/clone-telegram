import { LiaCheckDoubleSolid } from "react-icons/lia";
import { TypeMessage } from "../../app/enums";
import { Dropdown, Space } from "antd";
import { BsThreeDotsVertical } from "react-icons/bs";
import React from "react";
import socket from "../../socket";
import useLocalStorage from "../../hooks/useLocalStorage";
import { ACCESSTOKEN_KEY } from "../../app/constant";

const PrivateSender = ({ item }: { item: any }) => {
    const time = item.createdAt.slice(11, 16)
    const seen = item.seen.includes(item.receiver[0]._id)
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)

    const handleRecallsMessage = () => {
        if (!accessToken) return
        socket.emit("recallsMessage", { messageId: item._id, accessToken: accessToken.accessToken })
    }
    return (
        <li className=" list-none block">
            <div className="ml-[200px]  text-right px-4">
                <div className="text-white bg-primary px-6 pt-2 pb-4 rounded-lg inline-block relative">
                    {
                        item?.type == TypeMessage.TEXT &&
                        <React.Fragment>
                            {seen && <LiaCheckDoubleSolid className=" absolute right-0 bottom-0" />}
                            <p className="absolute right-5 bottom-0 text-xs">{time}</p>
                            <p>{item.message ? item.message : "Message has been recalled"}</p>
                        </React.Fragment>
                    }
                    {
                        item?.type == TypeMessage.IMAGE &&
                        <React.Fragment>
                            {seen && <LiaCheckDoubleSolid className=" absolute right-0 bottom-0" />}
                            <p className="absolute right-5 bottom-0 text-xs">{time}</p>
                            {item.message ?
                                <img src={item.message} alt="Image" className="w-28 rounded-lg" />
                                : <p>"Message has been recalled"</p>}
                        </React.Fragment>
                    }
                    {
                        item?.type == TypeMessage.VIDEO &&
                        <React.Fragment>
                            {seen && <LiaCheckDoubleSolid className=" absolute right-0 bottom-0" />}
                            <p className="absolute right-5 bottom-0 text-xs">{time}</p>
                            {item.message ?
                                <video src={item.message} controls className="w-52 rounded-lg" />
                                : <p>"Message has been recalled"</p>}
                        </React.Fragment>
                    }

                    <div className="flex items-center cursor-pointer rounded-xl absolute top-0 right-0">
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: '0',
                                        label: (
                                            <button className="text-red-500" onClick={(e) => { e.stopPropagation(), handleRecallsMessage() }}>Recalls message</button>
                                        ),
                                    },
                                ]
                            }}
                            trigger={['click']}>
                            <span onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="flex items-center p-1 hover:bg-slate-600 rounded-lg">
                                <Space>
                                    <BsThreeDotsVertical className="text-xs" />
                                </Space>
                            </span>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </li>



    )
}

export default PrivateSender