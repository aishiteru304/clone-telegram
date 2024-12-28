import { INFORMATION_KEY } from "../../app/constant"
import { TypeUser } from "../../enums/type-user.enum"
import useLocalStorage from "../../hooks/useLocalStorage"
import PrivateSender from "./private-sender";
import ReceiverMessage from "./receiver-message";

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
                <PrivateSender item={item} />
                :
                // Receiver
                <ReceiverMessage item={item} />

    )
}

export default MessageItem