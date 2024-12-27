import { COLORS_LIST, INFORMATION_KEY, MAX_COLOR } from "../../app/constant"
import { TypeUser } from "../../enums/type-user.enum"
import useLocalStorage from "../../hooks/useLocalStorage"
import { LiaCheckDoubleSolid } from "react-icons/lia";

const MessageItem = ({ item }: { item: any }) => {
    const { getLocalStorage } = useLocalStorage()
    const information = getLocalStorage(INFORMATION_KEY)
    const index = item.conversationId.members.indexOf(item.sender._id);
    const bgColor = COLORS_LIST[index % MAX_COLOR]
    const time = item.createdAt.slice(11, 16)

    return (
        item?.sender?.type == TypeUser.ADMIN ?
            // Admin
            <li></li>
            :
            item?.sender?._id == information?.userId ?
                // Sender
                <li className=" list-none block">
                    <div className="ml-[200px]  text-right px-4">
                        <div className="text-white bg-primary px-4 pt-2 pb-4 rounded-lg inline-block relative">
                            <LiaCheckDoubleSolid className=" absolute right-0 bottom-0" />
                            <p className="absolute right-5 bottom-0 text-xs">{time}</p>
                            <p>{item.message}</p>
                        </div>
                    </div>
                </li>
                :
                // Receiver
                <li className=" list-none block">
                    <div className="mr-[200px]  text-left pl-[60px] relative flex gap-2">
                        <div className={`w-10 h-10 ${bgColor} rounded-full absolute left-2 flex items-center justify-center text-white`}>
                            {item.sender.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`text-white ${bgColor} px-4 pt-2 pb-4 rounded-lg relative`}>
                            <p className="text-sm">{item.sender.fullName}</p>
                            <p className=" inline-block">{item.message}</p>
                            <p className="absolute right-1 bottom-0 text-xs">{time}</p>
                        </div>

                    </div>
                </li>

    )
}

export default MessageItem