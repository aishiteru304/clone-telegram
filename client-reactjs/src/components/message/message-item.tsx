import { INFORMATION_KEY } from "../../app/constant"
import { TypeUser } from "../../enums/type-user.enum"
import useLocalStorage from "../../hooks/useLocalStorage"

const MessageItem = ({ item }: { item: any }) => {
    const { getLocalStorage } = useLocalStorage()
    const information = getLocalStorage(INFORMATION_KEY)
    return (
        item?.sender?.type == TypeUser.ADMIN ?
            // Admin
            <li></li>
            :
            item?.sender?._id == information?.userId ?
                // Sender
                <li className=" list-none">{item.message}</li>
                :
                // Receiver
                <li className=" list-none">{item.message}</li>

    )
}

export default MessageItem