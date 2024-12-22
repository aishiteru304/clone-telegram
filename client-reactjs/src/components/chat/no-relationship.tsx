import { useParams } from "react-router-dom"
import socket from "../../socket"
import useLocalStorage from "../../hooks/useLocalStorage"
import { ACCESSTOKEN_KEY } from "../../app/constant"

const NoRelationship = () => {
    const { id } = useParams()
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)


    const handleAddRequest = () => {
        if (!id || !accessToken) return
        socket.emit('addFriendRequest', { accessToken: accessToken.accessToken, userId: id });

    }

    return (
        <div className=" bg-white border-l-[1px] py-2 flex justify-center items-center gap-4 mt-14">
            <p className="text-center">Add friend request</p>
            <button className="bg-primary px-2 py-1 rounded-md text-white" onClick={handleAddRequest}>Add</button>
        </div>
    )
}

export default NoRelationship