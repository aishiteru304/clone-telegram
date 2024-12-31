import { LiaCheckDoubleSolid } from "react-icons/lia";
import { TypeMessage } from "../../app/enums";
import React from "react";

const PrivateSender = ({ item }: { item: any }) => {
    const time = item.createdAt.slice(11, 16)
    const seen = item.seen.includes(item.receiver[0]._id)
    return (
        <React.Fragment>
            {
                item?.type == TypeMessage.TEXT && <li className=" list-none block">
                    <div className="ml-[200px]  text-right px-4">
                        <div className="text-white bg-primary px-6 pt-2 pb-4 rounded-lg inline-block relative">
                            {seen && <LiaCheckDoubleSolid className=" absolute right-0 bottom-0" />}
                            <p className="absolute right-5 bottom-0 text-xs">{time}</p>
                            <p>{item.message ? item.message : "Message has been recalled"}</p>
                        </div>
                    </div>
                </li>

            }

            {
                item?.type == TypeMessage.IMAGE && <li className=" list-none block">
                    <div className="ml-[200px]  text-right px-4">
                        <div className="text-white bg-primary px-6 pt-2 pb-4 rounded-lg inline-block relative">
                            {seen && <LiaCheckDoubleSolid className=" absolute right-0 bottom-0" />}
                            <p className="absolute right-5 bottom-0 text-xs">{time}</p>
                            {item.message ?
                                <img src={item.message} alt="Image" className="w-28 rounded-lg" />
                                : <p>"Message has been recalled"</p>}
                        </div>
                    </div>
                </li>

            }
            {
                item?.type == TypeMessage.VIDEO && <li className=" list-none block">
                    <div className="ml-[200px]  text-right px-4">
                        <div className="text-white bg-primary px-6 pt-2 pb-4 rounded-lg inline-block relative">
                            {seen && <LiaCheckDoubleSolid className=" absolute right-0 bottom-0" />}
                            <p className="absolute right-5 bottom-0 text-xs">{time}</p>
                            {item.message ?
                                <video src={item.message} controls className="w-52 rounded-lg" />
                                : <p>"Message has been recalled"</p>}
                        </div>
                    </div>
                </li>

            }
        </React.Fragment>
    )
}

export default PrivateSender