import { useParams } from "react-router-dom"
import useLocalStorage from "../../hooks/useLocalStorage"
import { ACCESSTOKEN_KEY } from "../../app/constant"
import socket from "../../socket"

const SenderRequest = () => {
    const { id } = useParams()
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)


    const handleDeleteRequest = () => {
        if (!id || !accessToken) return
        socket.emit('deleteFriendRequest', { accessToken: accessToken.accessToken, userId: id });

    }

    return (
        <div className=" bg-white border-l-[1px] py-2 flex justify-center items-center gap-4 mt-14">
            <p className="text-center">Delete friend request</p>
            <button className="px-2 py-1 text-red-500 border-red-500 rounded-md border-[1px]" onClick={handleDeleteRequest}>Delete</button>
        </div>
    )
}

export default SenderRequest