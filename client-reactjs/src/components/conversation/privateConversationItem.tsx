import { Link } from "react-router-dom"
import useLocalStorage from "../../hooks/useLocalStorage"
import { INFORMATION_KEY } from "../../app/constant"

const PrivateConversationItem = ({ conversation }: { conversation: any }) => {
    const { getLocalStorage } = useLocalStorage()
    const information = getLocalStorage(INFORMATION_KEY)

    const classNames = `${location.pathname == `/conversation/${conversation._id}` ? "bg-primary text-white hover:bg-primary" : ""}`
    return (
        <Link
            to={`/conversation/${conversation._id}`} key={conversation._id}
        >

            <span>
                {
                    conversation?.members?.map((member: any, index: string) => {
                        if (member._id != information?.userId) {
                            return (
                                <li key={index}
                                    className={`list-none flex gap-2 items-center p-2 cursor-pointer hover:bg-slate-300 rounded-lg transition-all duration-300 ease-in-out ${classNames}`}>
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        {member.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <span key={index}>{member.fullName} </span>
                                </li>
                            )
                        }
                        return null
                    })
                }

            </span>
        </Link>
    )
}

export default PrivateConversationItem