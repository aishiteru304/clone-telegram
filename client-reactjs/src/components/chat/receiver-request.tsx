import { useParams } from "react-router-dom"
import useLocalStorage from "../../hooks/useLocalStorage"
import { ACCESSTOKEN_KEY } from "../../app/constant"
import socket from "../../socket"

const ReceiverRequest = () => {
    const { id } = useParams()
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)


    const handleRejectRequest = () => {
        if (!id || !accessToken) return
        socket.emit('rejectFriendRequest', { accessToken: accessToken.accessToken, userId: id });
    }

    const handleAcceptRequest = () => {
        if (!id || !accessToken) return
        socket.emit('acceptFriendRequest', { accessToken: accessToken.accessToken, userId: id });
    }

    return (
        <div className=" bg-white border-l-[1px] py-2">
            <p className="text-center">Accept friend request</p>
            <div className="flex gap-2 text-white justify-center mt-2">
                <button className="bg-primary px-2 py-1 rounded-md" onClick={handleAcceptRequest}>Accept</button>
                <button className="px-2 py-1 text-red-500 border-red-500 rounded-md border-[1px]" onClick={handleRejectRequest}>Reject</button>
            </div>
        </div>
    )
}

export default ReceiverRequest