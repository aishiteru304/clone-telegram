import { MdAttachFile } from "react-icons/md";
import { FaTelegramPlane } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { ACCESSTOKEN_KEY } from "../../app/constant";
import useLocalStorage from "../../hooks/useLocalStorage";
import socket from "../../socket";
import DeleteFriend from "./delete-friend";
import ModalFile from "./modal-file";

const FriendComponent = () => {
    const { id } = useParams()
    const [messageText, setMessageText] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [data, setData] = useState<string[]>([]);
    const { getLocalStorage } = useLocalStorage()
    const [messageFile, setMessageFile] = useState<File | null>(null)
    const [isShowModal, setIsShowModal] = useState<boolean>(false)
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)

    useEffect(() => {
        setTimeout(() => {
            setData(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);
        }, 1000); // Giả lập trễ 1 giây
    }, [id]);

    // Hàm thêm emoji vào message
    const handleEmojiClick = (emojiObject: any) => {
        setMessageText((prevText) => prevText + emojiObject.emoji);
    };

    // Hàm trim message do user nhập
    const isTrimValue = () => {
        return messageText.trim()
    }

    // Hàm xử lý khi user gửi tin nhắn
    const handleSendText = () => {
        if (isTrimValue() == "") return
    }

    // Hàm xử lý khi change file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMessageFile(file)
            setIsShowModal(true)
            // Reset file
            e.target.value = ""
        }
    };

    return (
        <>
            {/* Section to show message content */}
            <div className="pt-16 h-screen overflow-hidden">
                <div className="flex flex-col gap-20 max-h-full overflow-y-auto custom-scrollbar">
                    {
                        data.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))
                    }
                </div>
            </div>

            {/* Section to show user input bar */}
            <footer className="bg-white py-4 fixed right-0 w-[70%] bottom-0 border border-l-[1px] flex items-center pr-8 pl-4">
                <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <MdAttachFile
                    className="text-2xl text-slate-400 rotate-45 cursor-pointer"
                    onClick={() => document.getElementById('fileInput')?.click()}
                />
                <input placeholder="Write a message..."
                    className=" pl-2 outline-none flex-grow"
                    onChange={e => setMessageText(e.target.value)}
                    value={messageText}
                />
                <button
                    className="text-2xl"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                    😊
                </button>
                {showEmojiPicker && (
                    <div className="absolute bottom-12 right-0">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}
                <FaTelegramPlane className={`text-2xl cursor-pointer rotate-12 ${isTrimValue() == "" ? "text-slate-400" : "text-primary"}`} onClick={handleSendText} />
            </footer>

            {/* Section to delete friend */}
            <DeleteFriend />

            {/* Modal to show file content */}
            <ModalFile file={messageFile} isShowModal={isShowModal} onClose={() => setIsShowModal(false)} />
        </>
    )
}

export default FriendComponent