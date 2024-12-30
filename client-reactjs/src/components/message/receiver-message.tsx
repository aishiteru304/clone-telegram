import React from "react"
import { TypeMessage } from "../../app/enums"
import { COLORS_LIST, MAX_COLOR } from "../../app/constant";

const ReceiverMessage = ({ item }: { item: any }) => {
    const time = item.createdAt.slice(11, 16)
    const index = item.conversationId.members.indexOf(item.sender._id);
    const bgColor = COLORS_LIST[index % MAX_COLOR]
    return (
        <React.Fragment>
            {
                item?.type == TypeMessage.TEXT && <li className=" list-none block">
                    <div className="mr-[200px]  text-left pl-[60px] relative flex gap-2">
                        <div className={`w-10 h-10 ${bgColor} rounded-full absolute left-2 flex items-center justify-center text-white`}>
                            {item.sender.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`text-white ${bgColor} px-4 pt-2 pb-4 rounded-lg relative`}>
                            <p className="text-sm">{item.sender.fullName}</p>
                            <p className=" inline-block">{item.message ? item.message : "Message has been recalled"}</p>
                            <p className="absolute right-1 bottom-0 text-xs">{time}</p>
                        </div>

                    </div>
                </li>
            }
            {
                item?.type == TypeMessage.IMAGE && <li className=" list-none block">
                    <div className="mr-[200px]  text-left pl-[60px] relative flex gap-2">
                        <div className={`w-10 h-10 ${bgColor} rounded-full absolute left-2 flex items-center justify-center text-white`}>
                            {item.sender.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`text-white ${bgColor} px-4 pt-2 pb-4 rounded-lg relative`}>
                            <p className="text-sm">{item.sender.fullName}</p>
                            {item.message ?
                                <img src={item.message} alt="Image" className="w-28 rounded-lg" />
                                : <p className=" inline-block"> "Message has been recalled"</p>
                            }
                            <p className="absolute right-1 bottom-0 text-xs">{time}</p>
                        </div>

                    </div>
                </li>
            }
        </React.Fragment>
    )
}

export default ReceiverMessage