import { Link } from "react-router-dom"
import useLocalStorage from "../../hooks/useLocalStorage"
import { COLORS_LIST, INFORMATION_KEY, MAX_COLOR } from "../../app/constant"

const PrivateConversationItem = ({ conversation, index, notify }: { conversation: any, index: number, notify: boolean }) => {
    const { getLocalStorage } = useLocalStorage()
    const information = getLocalStorage(INFORMATION_KEY)
    const bgColor = COLORS_LIST[index % MAX_COLOR]

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
                                    className={`list-none flex gap-2 items-center p-2 cursor-pointer hover:bg-slate-300 rounded-lg transition-all duration-300 ease-in-out ${classNames} relative`}>
                                    <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center text-white`}>
                                        {member.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <span key={index}>{member.fullName} </span>
                                    {notify && <span className=" absolute right-1 bg-red-500 px-2 py-1 rounded-md text-xs text-white">new</span>}
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