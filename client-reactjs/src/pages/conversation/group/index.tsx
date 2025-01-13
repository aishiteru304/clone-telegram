import React, { useEffect, useRef, useState } from "react"
import ConversationContent from "../../../components/conversation/conversation-content"
import { useNavigate, useParams } from "react-router-dom"
import useLocalStorage from "../../../hooks/useLocalStorage"
import { INFORMATION_KEY } from "../../../app/constant"
import { getConversationById } from "../api"
import useHandleResponseError from "../../../hooks/handleResponseError"

const ConversationGroupPage = () => {

    const { id } = useParams()
    const { getLocalStorage } = useLocalStorage()
    const userInfor = getLocalStorage(INFORMATION_KEY)
    const [groupName, setGroupName] = useState<string>("")
    const navigate = useNavigate()
    const handleResponseError = useHandleResponseError()
    const receiverIdRef = useRef<string[]>([])

    useEffect(() => {
        if (!id || !userInfor) return
        getConversationById(id)
            .then(res => {
                setGroupName(res.data.name)
                const filteredIds = res.data.members
                    .filter((member: any) => member._id !== userInfor.userId)
                    .map((member: any) => member._id);
                receiverIdRef.current = filteredIds
            })
            .catch(err => {
                if (err?.status == 500 || err?.status == 404)
                    navigate("/")
                handleResponseError(err)
            })

    }, [id])

    return (
        <React.Fragment>
            {
                groupName &&
                <div>
                    <header className="bg-white py-2 px-4 border border-l-[1px] fixed top-0 right-0 w-[70%]">
                        <div>
                            <p>{groupName}</p>
                        </div>
                    </header>

                    <ConversationContent receiverIds={receiverIdRef.current} />
                </div>
            }
        </React.Fragment>
    )
}

export default ConversationGroupPage